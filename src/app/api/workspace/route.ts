import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/auth/tenant';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type WorkspaceAction =
  | 'save_customer'
  | 'delete_customer'
  | 'save_order'
  | 'delete_order'
  | 'add_payment'
  | 'add_cost'
  | 'add_order_material'
  | 'remove_order_material'
  | 'save_partner'
  | 'save_reminder'
  | 'toggle_reminder'
  | 'delete_reminder'
  | 'save_inventory'
  | 'save_profile'
  | 'settle_invoice'
  | 'settle_partner_balance';

function nullable(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function errorResponse(error: unknown, status = 400) {
  console.error('Workspace persistence failed', error);
  return NextResponse.json({ error: 'Could not save workspace data' }, { status });
}

async function requireWorkspaceRequest() {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    return null;
  }

  return { tenant, supabase: await createClient() };
}

export async function GET() {
  const requestContext = await requireWorkspaceRequest();

  if (!requestContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tenant, supabase } = requestContext;

  try {
    const [businessResult, themeResult, customersResult, partnersResult, ordersResult, invoicesResult, remindersResult, inventoryResult, costsResult, partnerPaymentsResult] = await Promise.all([
      supabase.from('businesses').select('name, email, phone, currency, order_statuses, measurement_fields').eq('id', tenant.businessId).single(),
      supabase.from('business_themes').select('*').eq('business_id', tenant.businessId).single(),
      supabase.from('customers').select('*').eq('business_id', tenant.businessId).order('created_at', { ascending: false }),
      supabase.from('partners').select('*').eq('business_id', tenant.businessId).order('created_at', { ascending: false }),
      supabase.from('orders').select('*').eq('business_id', tenant.businessId).order('created_at', { ascending: false }),
      supabase.from('partner_invoices').select('*').eq('business_id', tenant.businessId),
      supabase.from('reminders').select('*').eq('business_id', tenant.businessId).order('due_at'),
      supabase.from('inventory_items').select('*').eq('business_id', tenant.businessId).order('name'),
      supabase.from('order_costs').select('*').eq('business_id', tenant.businessId),
      supabase.from('partner_payments').select('*').eq('business_id', tenant.businessId),
    ]);

    const results = [businessResult, themeResult, customersResult, partnersResult, ordersResult, invoicesResult, remindersResult, inventoryResult, costsResult, partnerPaymentsResult];
    const failedResult = results.find((result) => result.error);
    if (failedResult?.error) throw failedResult.error;

    const orders = ordersResult.data || [];
    const orderIds = orders.map((order) => order.id);
    const [measurementsResult, paymentsResult, photosResult, orderMaterialsResult] = orderIds.length
      ? await Promise.all([
          supabase.from('order_measurements').select('*').in('order_id', orderIds),
          supabase.from('order_payments').select('*').in('order_id', orderIds).order('paid_at'),
          supabase.from('order_reference_photos').select('*').in('order_id', orderIds),
          supabase.from('order_materials').select('*').in('order_id', orderIds).order('created_at'),
        ])
      : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }, { data: [], error: null }];

    if (measurementsResult.error || paymentsResult.error || photosResult.error || orderMaterialsResult.error) {
      throw measurementsResult.error || paymentsResult.error || photosResult.error || orderMaterialsResult.error;
    }

    const customers = customersResult.data || [];
    const partners = partnersResult.data || [];
    const costs = costsResult.data || [];
    const partnerPayments = partnerPaymentsResult.data || [];
    const customerById = new Map(customers.map((customer) => [customer.id, customer]));
    const partnerById = new Map(partners.map((partner) => [partner.id, partner]));
    const measurementByOrderId = new Map((measurementsResult.data || []).map((measurement) => [measurement.order_id, measurement]));
    const paymentsByOrderId = new Map<string, any[]>();
    const photosByOrderId = new Map<string, string[]>();
    const costsByOrderId = new Map<string, any[]>();
    const materialsByOrderId = new Map<string, any[]>();
    const inventoryById = new Map((inventoryResult.data || []).map((item) => [item.id, item]));

    for (const payment of paymentsResult.data || []) {
      paymentsByOrderId.set(payment.order_id, [...(paymentsByOrderId.get(payment.order_id) || []), payment]);
    }
    for (const photo of photosResult.data || []) {
      photosByOrderId.set(photo.order_id, [...(photosByOrderId.get(photo.order_id) || []), photo.storage_path]);
    }
    for (const cost of costs) {
      costsByOrderId.set(cost.order_id, [...(costsByOrderId.get(cost.order_id) || []), cost]);
    }
    for (const material of orderMaterialsResult.data || []) {
      materialsByOrderId.set(material.order_id, [...(materialsByOrderId.get(material.order_id) || []), material]);
    }

    const apiOrders = orders.map((order) => {
      const customer = customerById.get(order.customer_id);
      return {
        id: order.id,
        orderNumber: order.order_number,
        customerId: order.customer_id,
        customerName: customer?.name || 'Unknown customer',
        customerPhone: customer?.phone || '',
        itemType: order.item_type,
        price: numberValue(order.price),
        deposit: numberValue(order.deposit),
        paid: numberValue(order.paid),
        status: order.status,
        dueDate: order.due_date || '',
        createdAt: String(order.created_at).slice(0, 10),
        description: order.description,
        notes: order.notes || undefined,
        measurements: measurementByOrderId.get(order.id)?.measurements || {},
        referencePhotos: photosByOrderId.get(order.id) || [],
        materials: (materialsByOrderId.get(order.id) || []).map((material) => {
          const inventoryItem = inventoryById.get(material.material_id);
          return {
            id: material.id,
            materialId: material.material_id,
            materialName: inventoryItem?.name || 'Unknown material',
            unit: inventoryItem?.unit || 'unit',
            quantityUsed: numberValue(material.quantity_used),
            unitCost: numberValue(material.unit_cost),
            totalCost: numberValue(material.total_cost),
            createdAt: String(material.created_at),
          };
        }),
        costs: (costsByOrderId.get(order.id) || []).map((cost) => ({
          id: cost.id,
          item: cost.item,
          costType: cost.cost_type,
          amount: numberValue(cost.amount),
          partnerId: cost.partner_id || undefined,
          partnerName: cost.partner_id ? partnerById.get(cost.partner_id)?.name : undefined,
          status: cost.status,
          dueDate: cost.due_date || undefined,
          notes: cost.notes || undefined,
        })),
        paymentLogs: (paymentsByOrderId.get(order.id) || []).map((payment) => ({
          id: payment.id,
          amount: numberValue(payment.amount),
          method: payment.method,
          date: String(payment.paid_at).slice(0, 10),
          note: payment.note || undefined,
        })),
      };
    });

    const apiCustomers = customers.map((customer) => {
      const customerOrders = apiOrders.filter((order) => order.customerId === customer.id);
      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        altPhone: customer.alt_phone || undefined,
        email: customer.email || undefined,
        address: customer.address || undefined,
        notes: customer.notes || undefined,
        initials: customer.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'CL',
        totalOrders: customerOrders.length,
        balance: customerOrders.reduce((total, order) => total + Math.max(0, order.price - order.paid), 0),
        createdAt: String(customer.created_at).slice(0, 10),
      };
    });

    return NextResponse.json({
      shopProfile: {
        name: businessResult.data.name,
        email: businessResult.data.email || tenant.email,
        phone: businessResult.data.phone || '',
        currency: businessResult.data.currency,
        version: 'v1.2.0',
        theme: themeResult.data.theme_mode,
        logoUrl: themeResult.data.logo_url || '',
        brandAccent: themeResult.data.accent_color,
        businessTheme: {
          logoUrl: themeResult.data.logo_url || '',
          primaryColor: themeResult.data.primary_color,
          primaryHover: themeResult.data.primary_hover,
          primaryLight: themeResult.data.primary_light,
          secondaryColor: themeResult.data.secondary_color,
          accentColor: themeResult.data.accent_color,
          backgroundColor: themeResult.data.background_color,
          surfaceColor: themeResult.data.surface_color,
          surfaceContainer: themeResult.data.surface_container,
          surfaceContainerHigh: themeResult.data.surface_container_high,
          textColor: themeResult.data.text_color,
          textMuted: themeResult.data.text_muted,
          borderColor: themeResult.data.border_color,
          contrastRatio: 0,
          wcagRating: 'Pass',
          harmonyName: 'Business theme',
          extractedPalette: [],
        },
        statuses: businessResult.data.order_statuses || ['Confirmed', 'In Progress', 'Ready for Fitting', 'Ready', 'Completed'],
        measurementFields: Array.isArray(businessResult.data.measurement_fields)
          ? businessResult.data.measurement_fields
          : ['shoulder', 'bust', 'waist', 'hips', 'length', 'sleeve', 'neck', 'inseam'],
        activeMetrics: [],
      },
      orders: apiOrders,
      customers: apiCustomers,
      partners: partners.map((partner) => {
        const partnerCosts = costs.filter((cost) => cost.partner_id === partner.id);
        const settlementTotal = partnerPayments.filter((payment) => payment.partner_id === partner.id).reduce((total, payment) => total + numberValue(payment.amount), 0);
        return {
          id: partner.id,
          name: partner.name,
          type: partner.partner_type,
          phone: partner.phone || undefined,
          email: partner.email || undefined,
          notes: partner.notes || undefined,
          balanceOwed: Math.max(0, partnerCosts.filter((cost) => cost.status !== 'Paid').reduce((total, cost) => total + numberValue(cost.amount), 0) - settlementTotal),
          totalPaid: partnerCosts.filter((cost) => cost.status === 'Paid').reduce((total, cost) => total + numberValue(cost.amount), 0) + settlementTotal,
        };
      }),
      invoices: (invoicesResult.data || []).map((invoice) => ({
        id: invoice.id,
        partnerId: invoice.partner_id,
        partnerName: partnerById.get(invoice.partner_id)?.name || 'Unknown partner',
        invoiceNumber: invoice.invoice_number,
        title: invoice.title,
        amount: numberValue(invoice.amount),
        dueDate: invoice.due_date || '',
        status: invoice.status,
        category: invoice.category,
      })),
      reminders: (remindersResult.data || []).map((reminder) => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        dueDate: String(reminder.due_at).slice(0, 10),
        type: reminder.reminder_type,
        completed: reminder.completed,
        recipientName: reminder.recipient_name || undefined,
        recipientPhone: reminder.recipient_phone || undefined,
        orderId: reminder.order_id || undefined,
        amount: reminder.amount === null ? undefined : numberValue(reminder.amount),
      })),
      inventory: (inventoryResult.data || []).map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        stock: numberValue(item.stock),
        unit: item.unit,
        costPerUnit: numberValue(item.cost_per_unit),
        minStockLevel: numberValue(item.min_stock_level),
        supplier: item.supplier || undefined,
      })),
    });
  } catch (error) {
    return errorResponse(error, 500);
  }
}

export async function POST(request: Request) {
  const requestContext = await requireWorkspaceRequest();
  if (!requestContext) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { tenant, supabase } = requestContext;

  try {
    const { action, payload } = await request.json() as { action: WorkspaceAction; payload: any };

    switch (action) {
      case 'save_customer': {
        const customer = payload;
        const { error } = await supabase.from('customers').upsert({
          id: customer.id,
          business_id: tenant.businessId,
          name: customer.name,
          phone: customer.phone,
          alt_phone: nullable(customer.altPhone),
          email: nullable(customer.email),
          address: nullable(customer.address),
          notes: nullable(customer.notes),
        });
        if (error) throw error;
        break;
      }
      case 'delete_customer': {
        const { error } = await supabase.from('customers').delete().eq('id', payload.id).eq('business_id', tenant.businessId);
        if (error) throw error;
        break;
      }
      case 'save_order': {
        const order = payload;
        const { error } = await supabase.from('orders').upsert({
          id: order.id,
          business_id: tenant.businessId,
          customer_id: order.customerId,
          order_number: order.orderNumber,
          item_type: order.itemType,
          price: numberValue(order.price),
          deposit: numberValue(order.deposit),
          paid: numberValue(order.paid),
          status: order.status,
          due_date: nullable(order.dueDate),
          description: order.description || '',
          notes: nullable(order.notes),
        });
        if (error) throw error;

        const { error: measurementError } = await supabase.from('order_measurements').upsert({
          order_id: order.id,
          measurements: order.measurements || {},
        });
        if (measurementError) throw measurementError;

        for (const payment of order.paymentLogs || []) {
          const { error: paymentError } = await supabase.from('order_payments').upsert({
            id: payment.id,
            order_id: order.id,
            amount: numberValue(payment.amount),
            method: payment.method,
            paid_at: payment.date,
            note: nullable(payment.note),
          });
          if (paymentError) throw paymentError;
        }
        for (const storagePath of order.referencePhotos || []) {
          const { error: photoError } = await supabase.from('order_reference_photos').upsert({
            order_id: order.id,
            storage_path: storagePath,
          }, { onConflict: 'order_id,storage_path', ignoreDuplicates: true });
          if (photoError) throw photoError;
        }
        break;
      }
      case 'delete_order': {
        const { data: consumedMaterials, error: materialsError } = await supabase
          .from('order_materials')
          .select('material_id, quantity_used')
          .eq('order_id', payload.id)
          .eq('business_id', tenant.businessId);
        if (materialsError) throw materialsError;
        const { error } = await supabase.from('orders').delete().eq('id', payload.id).eq('business_id', tenant.businessId);
        if (error) throw error;
        return NextResponse.json({
          ok: true,
          restoredMaterials: (consumedMaterials || []).map((material) => ({
            materialId: material.material_id,
            quantityUsed: numberValue(material.quantity_used),
          })),
        });
      }
      case 'add_payment': {
        const { orderId, payment } = payload;
        const { data: order, error: orderError } = await supabase.from('orders').select('paid').eq('id', orderId).eq('business_id', tenant.businessId).single();
        if (orderError || !order) throw orderError || new Error('Order not found');
        const { error: paymentError } = await supabase.from('order_payments').insert({
          id: payment.id,
          order_id: orderId,
          amount: numberValue(payment.amount),
          method: payment.method,
          paid_at: payment.date,
          note: nullable(payment.note),
        });
        if (paymentError) throw paymentError;
        const { error: updateError } = await supabase.from('orders').update({ paid: numberValue(order.paid) + numberValue(payment.amount) }).eq('id', orderId).eq('business_id', tenant.businessId);
        if (updateError) throw updateError;
        break;
      }
      case 'add_cost': {
        const { orderId, cost } = payload;
        const { error } = await supabase.from('order_costs').insert({
          id: cost.id,
          business_id: tenant.businessId,
          order_id: orderId,
          partner_id: nullable(cost.partnerId),
          item: cost.item,
          cost_type: cost.costType,
          amount: numberValue(cost.amount),
          status: cost.status,
          due_date: nullable(cost.dueDate),
          notes: nullable(cost.notes),
        });
        if (error) throw error;
        break;
      }
      case 'add_order_material': {
        const { orderId, materialId, quantityUsed } = payload;
        const { data, error } = await supabase.rpc('consume_order_material', {
          p_order_id: orderId,
          p_material_id: materialId,
          p_quantity_used: numberValue(quantityUsed),
        });
        if (error) throw error;
        return NextResponse.json({ ok: true, material: data });
      }
      case 'remove_order_material': {
        const { data, error } = await supabase.rpc('release_order_material', {
          p_order_material_id: payload.orderMaterialId,
        });
        if (error) throw error;
        return NextResponse.json({ ok: true, restoredMaterial: data });
      }
      case 'save_partner': {
        const partner = payload;
        const { error } = await supabase.from('partners').upsert({
          id: partner.id,
          business_id: tenant.businessId,
          name: partner.name,
          partner_type: partner.type,
          phone: nullable(partner.phone),
          email: nullable(partner.email),
          notes: nullable(partner.notes),
        });
        if (error) throw error;
        break;
      }
      case 'save_reminder': {
        const reminder = payload;
        const { error } = await supabase.from('reminders').upsert({
          id: reminder.id,
          business_id: tenant.businessId,
          order_id: nullable(reminder.orderId),
          title: reminder.title,
          description: reminder.description || '',
          due_at: reminder.dueDate,
          reminder_type: reminder.type,
          completed: Boolean(reminder.completed),
          recipient_name: nullable(reminder.recipientName),
          recipient_phone: nullable(reminder.recipientPhone),
          amount: reminder.amount === undefined ? null : numberValue(reminder.amount),
        });
        if (error) throw error;
        break;
      }
      case 'toggle_reminder': {
        const { error } = await supabase.from('reminders').update({ completed: Boolean(payload.completed) }).eq('id', payload.id).eq('business_id', tenant.businessId);
        if (error) throw error;
        break;
      }
      case 'delete_reminder': {
        const { error } = await supabase.from('reminders').delete().eq('id', payload.id).eq('business_id', tenant.businessId);
        if (error) throw error;
        break;
      }
      case 'save_inventory': {
        const item = payload;
        const { error } = await supabase.from('inventory_items').upsert({
          id: item.id,
          business_id: tenant.businessId,
          name: item.name,
          category: item.category,
          stock: numberValue(item.stock),
          unit: item.unit || 'unit',
          cost_per_unit: numberValue(item.costPerUnit),
          min_stock_level: numberValue(item.minStockLevel),
          supplier: nullable(item.supplier),
        });
        if (error) throw error;
        break;
      }
      case 'save_profile': {
        const profile = payload;
        const { error: businessError } = await supabase.from('businesses').update({
          name: profile.name,
          email: nullable(profile.email),
          phone: nullable(profile.phone),
          currency: profile.currency || 'ETB',
          order_statuses: Array.isArray(profile.statuses) && profile.statuses.length ? profile.statuses : ['Confirmed'],
          measurement_fields: Array.isArray(profile.measurementFields) && profile.measurementFields.length
            ? profile.measurementFields
            : ['shoulder', 'bust', 'waist', 'hips', 'length', 'sleeve', 'neck', 'inseam'],
        }).eq('id', tenant.businessId);
        if (businessError) throw businessError;
        const theme = profile.businessTheme;
        if (theme) {
          const { error: themeError } = await supabase.from('business_themes').update({
            logo_url: nullable(profile.logoUrl),
            accent_color: theme.accentColor,
            primary_color: theme.primaryColor,
            primary_hover: theme.primaryHover,
            primary_light: theme.primaryLight,
            secondary_color: theme.secondaryColor,
            background_color: theme.backgroundColor,
            surface_color: theme.surfaceColor,
            surface_container: theme.surfaceContainer,
            surface_container_high: theme.surfaceContainerHigh,
            text_color: theme.textColor,
            text_muted: theme.textMuted,
            border_color: theme.borderColor,
            theme_mode: profile.theme,
          }).eq('business_id', tenant.businessId);
          if (themeError) throw themeError;
        }
        break;
      }
      case 'settle_invoice': {
        const { error } = await supabase.from('partner_invoices').update({ status: 'Paid' }).eq('id', payload.id).eq('business_id', tenant.businessId);
        if (error) throw error;
        break;
      }
      case 'settle_partner_balance': {
        const { error } = await supabase.from('partner_payments').insert({
          business_id: tenant.businessId,
          partner_id: payload.id,
          amount: numberValue(payload.amount),
        });
        if (error) throw error;
        break;
      }
      default:
        return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
