import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, Send, Phone } from 'lucide-react';

interface MessageSenderModalProps {
  isOpen: boolean;
  recipientName: string;
  recipientPhone: string;
  defaultMessage: string;
  onClose: () => void;
}

export const MessageSenderModal: React.FC<MessageSenderModalProps> = ({
  isOpen,
  recipientName,
  recipientPhone,
  defaultMessage,
  onClose,
}) => {
  const [message, setMessage] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleOpenSMS = () => {
    const encoded = encodeURIComponent(message);
    window.open(`sms:${recipientPhone}?body=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fff8f4] dark:bg-[#1c1510] text-[#211a15] dark:text-[#f7ebe1] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] flex justify-between items-center bg-white dark:bg-[#241a13]">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
            <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white">
              Send Reminder to {recipientName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#847466] dark:text-[#a08e80] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-[#fff1e7] dark:bg-[#2a2018] rounded-lg border border-[#d7c3b2]/20 dark:border-[#524438] text-xs flex items-center justify-between">
            <span className="text-[#524438] dark:text-[#d7c3b2]">Recipient:</span>
            <span className="font-bold text-[#211a15] dark:text-white flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#885000] dark:text-[#ffb86d]" /> {recipientPhone || 'No phone recorded'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Message Content
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-green-700 font-sans"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="py-2.5 px-3 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" /> Open WhatsApp
              </button>

              <button
                type="button"
                onClick={handleOpenSMS}
                className="py-2.5 px-3 bg-[#885000] hover:bg-[#a6681c] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" /> Open SMS
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="py-2 px-3 bg-white dark:bg-[#241a13] border border-[#d7c3b2]/40 dark:border-[#524438] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] text-[#524438] dark:text-[#d7c3b2] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-700 dark:text-green-400" /> Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Message Text
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
