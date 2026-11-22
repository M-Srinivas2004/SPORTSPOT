import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { Conversation, Message } from '../../types';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { MessageSquare, Send, User, Building, CheckCheck } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get<Conversation[]>('/messages/conversations');
      if (res.success && res.data) {
        setConversations(res.data);
        const convParam = searchParams.get('conversation');
        if (convParam) {
          const matched = res.data.find((c) => c.id === convParam);
          if (matched) setActiveConv(matched);
        } else if (res.data.length > 0 && !activeConv) {
          setActiveConv(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await api.get<Message[]>(`/messages/conversations/${convId}/messages`);
      if (res.success && res.data) {
        setMessages(res.data);
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
      if (socket) {
        socket.emit('join_conversation', activeConv.id);
      }
    }

    return () => {
      if (activeConv && socket) {
        socket.emit('leave_conversation', activeConv.id);
      }
    };
  }, [activeConv?.id]);

  // Real-time socket message reception
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (msg: Message) => {
      if (msg.conversationId === activeConv?.id) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(scrollToBottom, 50);
      }
    };

    socket.on('new_live_message', handleIncomingMessage);
    return () => {
      socket.off('new_live_message', handleIncomingMessage);
    };
  }, [socket, activeConv?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !activeConv) return;

    try {
      setSending(true);
      const content = newContent.trim();
      setNewContent('');

      // Send via REST endpoint for guaranteed DB persistence
      const res = await api.post<Message>('/messages/messages', {
        conversationId: activeConv.id,
        content,
      });

      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!]);
        // Also emit socket message for active recipients
        if (socket) {
          socket.emit('send_live_message', {
            conversationId: activeConv.id,
            content,
          });
        }
        setTimeout(scrollToBottom, 50);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to deliver message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner text="Connecting to encrypted messaging..." className="py-20" />;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-black font-display text-text-primary">
          Encrypted Direct Communications
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Real-time conversations between verified athletes and sponsors.
        </p>
      </div>

      <div className="flex-1 bg-background-secondary rounded-2xl border border-border-subtle overflow-hidden flex flex-col md:flex-row">
        {/* Left: Conversations Threads List */}
        <div className="w-full md:w-80 border-r border-border-subtle flex flex-col">
          <div className="p-3.5 border-b border-border-subtle text-xs font-bold uppercase tracking-wider text-text-muted">
            Conversations ({conversations.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/50">
            {conversations.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-10 px-4">
                No active conversations yet. Messages appear when sponsorships are proposed.
              </p>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConv?.id === conv.id;
                const counterpartyName =
                  user?.role === 'ATHLETE'
                    ? conv.sponsor?.companyName
                    : conv.athlete?.fullName;
                const subtitle =
                  user?.role === 'ATHLETE'
                    ? 'Sponsor Representative'
                    : conv.athlete?.primarySport;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center gap-3 ${
                      isActive
                        ? 'bg-accent/10 border-l-2 border-accent'
                        : 'hover:bg-background-elevated/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-background-elevated border border-border-subtle flex items-center justify-center font-bold text-accent shrink-0">
                      {counterpartyName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-text-primary truncate">
                          {counterpartyName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-text-muted truncate mt-0.5">{subtitle}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Window */}
        {activeConv ? (
          <div className="flex-1 flex flex-col justify-between h-full bg-background-primary/40">
            {/* Conversation Header */}
            <div className="p-3.5 border-b border-border-subtle flex items-center justify-between bg-background-secondary">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent text-background-primary flex items-center justify-center font-black text-sm">
                  {user?.role === 'ATHLETE'
                    ? activeConv.sponsor?.companyName.slice(0, 2).toUpperCase()
                    : activeConv.athlete?.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    {user?.role === 'ATHLETE'
                      ? activeConv.sponsor?.companyName
                      : activeConv.athlete?.fullName}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Secure Live Channel
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-16 text-xs text-text-muted">
                  Start the conversation by sending a direct message below.
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-accent text-background-primary font-medium rounded-br-none shadow-glow'
                            : 'bg-background-elevated text-text-primary border border-border-subtle rounded-bl-none'
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[9px] text-text-muted mt-1 px-1">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-background-secondary border-t border-border-subtle flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="flex-1 rounded-xl bg-background-elevated border border-border-subtle px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
              />
              <Button type="submit" variant="primary" size="sm" isLoading={sending} rightIcon={<Send className="w-3.5 h-3.5" />}>
                Send
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-text-muted text-xs">
            <MessageSquare className="w-12 h-12 mb-3 text-text-muted/40" />
            <span>Select a conversation to read message history</span>
          </div>
        )}
      </div>
    </div>
  );
};
