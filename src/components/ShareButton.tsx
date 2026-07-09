import React, { useState } from "react";
import { Share2, Check, Copy, X } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, url }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareText = `Watch "${title}" free on AuraScreen`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl });
      } catch {}
    } else {
      setShowMenu(!showMenu);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    { name: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, color: "bg-green-600" },
    { name: "Twitter", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, color: "bg-sky-500" },
    { name: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, color: "bg-blue-500" },
  ];

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all text-sm"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 bg-secondary border border-white/10 rounded-xl shadow-2xl z-50 p-3 min-w-[200px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Share</span>
              <button onClick={() => setShowMenu(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <div className={`w-8 h-8 rounded-full ${link.color} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{link.name[0]}</span>
                  </div>
                  <span className="text-sm text-gray-300">{link.name}</span>
                </a>
              ))}

              <button
                onClick={handleCopy}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors w-full"
              >
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm text-gray-300">{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
