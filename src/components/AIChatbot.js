import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import { supabase } from '../api/supabaseClient';
import ReactMarkdown from 'react-markdown';
import './AIChatbot.css';

const AIChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your AI Medical Equipment Assistant. I can help you find the perfect medical equipment for your needs. What are you looking for today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to call Supabase Edge Function
  const sendMessageToAI = async (userMessage) => {
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Add user message to chat
      const userMsg = {
        id: Date.now(),
        role: 'user',
        content: userMessage
      };
      setMessages(prev => [...prev, userMsg]);

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-medical-assistant', {
        body: {
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          })),
          stream: true
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to connect to AI service');
      }

      if (!data || !data.body) {
        throw new Error('Invalid response from AI service');
      }

      // Handle streaming response
      const reader = data.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      
      // Add empty assistant message that will be updated
      const assistantMsgId = Date.now() + 1;
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: ''
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') continue;
            
            try {
              const json = JSON.parse(jsonStr);
              const content = json.choices?.[0]?.delta?.content || '';
              assistantMessage += content;
              
              // Update the assistant message
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMsgId 
                  ? { ...msg, content: assistantMessage }
                  : msg
              ));
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Provide more specific error messages
      let errorMessage = 'I apologize, but I encountered an error. ';
      
      if (error.message?.includes('not configured') || error.message?.includes('API key')) {
        errorMessage += 'The AI service is being set up. Please try again in a few moments.';
      } else if (error.message?.includes('database')) {
        errorMessage += 'I\'m having trouble accessing product information. Please try again later.';
      } else if (error.message?.includes('rate limit')) {
        errorMessage += 'Too many requests. Please wait a moment before trying again.';
      } else if (error.message?.includes('Failed to connect')) {
        errorMessage += 'Unable to connect to the AI service. Please check your internet connection.';
      } else {
        errorMessage += 'Please try again later or contact support if the issue persists.';
      }
      
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      sendMessageToAI(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`ai-chatbot ${isOpen ? 'open' : ''}`}>
      <div className="chatbot-header">
        <div className="header-content">
          <FaRobot className="header-icon" />
          <h3>AI Medical Assistant</h3>
        </div>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="chatbot-messages" ref={chatContainerRef}>
        {messages.map((message) => {
          // Only render messages that have content
          if (!message.content || message.content.trim() === '') {
            return null;
          }
          return (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'assistant' ? <FaRobot /> : <FaUser />}
              </div>
              <div className="message-content">
                {message.role === 'assistant' ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about medical equipment..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputMessage.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default AIChatbot;