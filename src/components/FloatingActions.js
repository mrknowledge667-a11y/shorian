import React, { useState } from 'react';
import { FaWhatsapp, FaRobot } from 'react-icons/fa';
import AIChatbot from './AIChatbot';
import './FloatingActions.css';

const FloatingActions = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  
  // WhatsApp configuration - Egypt number
  const whatsappNumber = '+2001035361005'; // Egypt WhatsApp number
  const whatsappMessage = encodeURIComponent('مرحباً، أريد الاستفسار عن المعدات الطبية');
  const whatsappLink = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${whatsappMessage}`;
  
  const handleWhatsAppClick = () => {
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  };
  
  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };
  
  return (
    <>
      <div className="floating-actions">
        {/* WhatsApp Button */}
        <button
          className="floating-action-btn whatsapp-btn"
          onClick={handleWhatsAppClick}
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
        >
          <FaWhatsapp size={24} />
        </button>
        
        {/* AI Chatbot Button */}
        <button
          className="floating-action-btn ai-btn"
          onClick={toggleChatbot}
          aria-label="Open AI Assistant"
          title="AI Medical Equipment Assistant"
        >
          <FaRobot size={24} />
        </button>
      </div>
      
      {/* AI Chatbot Component - keep mounted to preserve in-memory chat history */}
      <AIChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </>
  );
};

export default FloatingActions;