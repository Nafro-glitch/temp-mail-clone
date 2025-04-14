'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// واجهة لتمثيل الرسالة
interface Message {
  id: string;
  from: string;
  subject: string;
  content: string;
  receivedAt: string;
  read: boolean;
}

export default function Inbox() {
  const [email, setEmail] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const router = useRouter();

  // جلب البريد الإلكتروني الحالي والرسائل
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب البريد الإلكتروني الحالي
        const emailResponse = await fetch('/api/email');
        const emailData = await emailResponse.json();
        
        if (!emailData.success) {
          // إذا لم يكن هناك بريد إلكتروني، توجيه المستخدم إلى الصفحة الرئيسية
          router.push('/');
          return;
        }
        
        setEmail(emailData.email);
        
        // جلب الرسائل
        const messagesResponse = await fetch('/api/email/messages');
        const messagesData = await messagesResponse.json();
        
        if (messagesData.success) {
          setMessages(messagesData.messages);
        }
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // تحديث الرسائل كل 30 ثانية
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [router]);

  // تحديث حالة قراءة الرسالة
  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch('/api/email/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });
      
      if (response.ok) {
        // تحديث حالة الرسالة محلياً
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, read: true } : msg
          )
        );
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة قراءة الرسالة:', error);
    }
  };

  // عرض تفاصيل الرسالة
  const viewMessage = (message: Message) => {
    setSelectedMessage(message);
    
    // إذا لم تكن الرسالة مقروءة، تحديث حالتها
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  // تنسيق التاريخ والوقت
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // تحديث الرسائل
  const refreshMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/messages');
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('خطأ في تحديث الرسائل:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">صندوق الوارد</h1>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                العودة للرئيسية
              </Link>
              <button 
                onClick={refreshMessages}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                disabled={loading}
              >
                {loading ? 'جاري التحديث...' : 'تحديث الرسائل'}
              </button>
            </div>
          </div>
          
          {email && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">البريد الإلكتروني المؤقت الخاص بك</h2>
              <div className="bg-gray-100 p-3 rounded-lg text-lg font-mono break-all">
                {email}
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <h3 className="text-lg font-semibold mb-4">الرسائل الواردة</h3>
                {messages.length === 0 ? (
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <p className="text-gray-500">لا توجد رسائل في صندوق الوارد</p>
                    <p className="text-sm text-gray-400 mt-2">الرسائل الجديدة ستظهر هنا تلقائياً</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {messages.map((message) => (
                      <div 
                        key={message.id}
                        onClick={() => viewMessage(message)}
                        className={`p-3 rounded-lg cursor-pointer transition ${
                          selectedMessage?.id === message.id 
                            ? 'bg-blue-100 border-blue-500 border' 
                            : message.read 
                              ? 'bg-gray-100 hover:bg-gray-200' 
                              : 'bg-white border-blue-500 border hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-semibold truncate" style={{ maxWidth: '200px' }}>
                            {message.subject}
                          </div>
                          {!message.read && (
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {message.from}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDateTime(message.receivedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="md:w-2/3 bg-gray-50 rounded-lg p-4">
                {selectedMessage ? (
                  <div>
                    <div className="border-b pb-4 mb-4">
                      <h3 className="text-xl font-bold">{selectedMessage.subject}</h3>
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <div>من: {selectedMessage.from}</div>
                        <div>{formatDateTime(selectedMessage.receivedAt)}</div>
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: selectedMessage.content }} />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg">اختر رسالة لعرض محتواها</p>
                      <p className="text-sm mt-2">أو انتظر وصول رسائل جديدة</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">كيفية استخدام صندوق الوارد</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>يتم تحديث صندوق الوارد تلقائياً كل 30 ثانية.</li>
            <li>يمكنك النقر على زر "تحديث الرسائل" للتحديث اليدوي.</li>
            <li>الرسائل غير المقروءة تظهر بعلامة زرقاء.</li>
            <li>انقر على أي رسالة لعرض محتواها.</li>
            <li>يمكنك العودة إلى الصفحة الرئيسية في أي وقت.</li>
            <li>تذكر أن البريد المؤقت ينتهي بعد 45 دقيقة من إنشائه.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
