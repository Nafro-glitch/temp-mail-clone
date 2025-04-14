'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [email, setEmail] = useState<string>('');
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [customEmail, setCustomEmail] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('emailo.pro');
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);
  const router = useRouter();

  const domains = ['emailo.pro', 'mailo.live', 'posto.tech', 'inboxo.me', 'mailer.cloud'];

  // جلب البريد الإلكتروني الحالي إذا كان موجودًا
  useEffect(() => {
    const fetchCurrentEmail = async () => {
      try {
        const response = await fetch('/api/email');
        const data = await response.json();
        
        if (data.success) {
          setEmail(data.email);
          setExpiryTime(data.expiryTime);
        }
      } catch (error) {
        console.error('خطأ في جلب البريد الإلكتروني:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentEmail();
  }, []);

  // تحديث العد التنازلي
  useEffect(() => {
    if (!expiryTime) return;

    const updateCountdown = () => {
      const now = Date.now();
      const diff = expiryTime - now;
      
      if (diff <= 0) {
        setTimeLeft('00:00');
        return;
      }
      
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [expiryTime]);

  // إنشاء بريد إلكتروني عشوائي
  const createRandomEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ random: true }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEmail(data.email);
        setExpiryTime(data.expiryTime);
        router.refresh();
      }
    } catch (error) {
      console.error('خطأ في إنشاء البريد الإلكتروني:', error);
    } finally {
      setLoading(false);
    }
  };

  // إنشاء بريد إلكتروني مخصص
  const createCustomEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: customEmail, 
          domain: selectedDomain 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEmail(data.email);
        setExpiryTime(data.expiryTime);
        setShowCustomForm(false);
        router.refresh();
      }
    } catch (error) {
      console.error('خطأ في إنشاء البريد الإلكتروني المخصص:', error);
    } finally {
      setLoading(false);
    }
  };

  // تجديد صلاحية البريد الإلكتروني
  const renewEmail = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/email/renew', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setExpiryTime(data.expiryTime);
      }
    } catch (error) {
      console.error('خطأ في تجديد صلاحية البريد الإلكتروني:', error);
    } finally {
      setLoading(false);
    }
  };

  // حذف البريد الإلكتروني
  const deleteEmail = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/email', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEmail('');
        setExpiryTime(null);
        router.refresh();
      }
    } catch (error) {
      console.error('خطأ في حذف البريد الإلكتروني:', error);
    } finally {
      setLoading(false);
    }
  };

  // نسخ البريد الإلكتروني إلى الحافظة
  const copyEmail = () => {
    if (!email) return;
    
    navigator.clipboard.writeText(email)
      .then(() => {
        alert('تم نسخ البريد الإلكتروني بنجاح');
      })
      .catch((error) => {
        console.error('خطأ في نسخ البريد الإلكتروني:', error);
      });
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">خدمة البريد المؤقت - مهمل</h1>
          
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {email ? (
                <div className="text-center">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">البريد الإلكتروني المؤقت الخاص بك</h2>
                    <div className="flex items-center justify-center">
                      <div className="bg-gray-100 p-3 rounded-lg text-lg font-mono break-all">
                        {email}
                      </div>
                      <button 
                        onClick={copyEmail}
                        className="ml-2 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
                        title="نسخ البريد الإلكتروني"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-center items-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-gray-200 stroke-current"
                            strokeWidth="8"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                          ></circle>
                          <circle
                            className="text-blue-500 stroke-current"
                            strokeWidth="8"
                            strokeLinecap="round"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            strokeDasharray="251.2"
                            strokeDashoffset={expiryTime ? (251.2 * (1 - (expiryTime - Date.now()) / (45 * 60 * 1000))) : 0}
                          ></circle>
                        </svg>
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xl font-bold">{timeLeft}</div>
                            <div className="text-xs text-gray-500">الوقت المتبقي</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-4 rtl:space-x-reverse">
                    <Link href="/inbox" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                      صندوق الوارد
                    </Link>
                    <button 
                      onClick={renewEmail}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                    >
                      تجديد الصلاحية
                    </button>
                    <button 
                      onClick={() => setShowCustomForm(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      تغيير البريد
                    </button>
                    <button 
                      onClick={deleteEmail}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      حذف البريد
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  {showCustomForm ? (
                    <div className="max-w-md mx-auto">
                      <h2 className="text-xl font-semibold mb-4">إنشاء بريد إلكتروني مخصص</h2>
                      <form onSubmit={createCustomEmail} className="space-y-4">
                        <div className="flex">
                          <input
                            type="text"
                            value={customEmail}
                            onChange={(e) => setCustomEmail(e.target.value)}
                            placeholder="أدخل اسم البريد الإلكتروني"
                            className="flex-1 p-2 border border-gray-300 rounded-r-none rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          <span className="p-2 bg-gray-200 border-t border-b border-gray-300">@</span>
                          <select
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                            className="p-2 border border-gray-300 rounded-l-none rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {domains.map((domain) => (
                              <option key={domain} value={domain}>
                                {domain}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex space-x-4 rtl:space-x-reverse">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                          >
                            إنشاء
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCustomForm(false)}
                            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                          >
                            إلغاء
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">إنشاء بريد إلكتروني مؤقت</h2>
                      <div className="flex justify-center space-x-4 rtl:space-x-reverse">
                        <button
                          onClick={createRandomEmail}
                          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition text-lg"
                        >
                          إنشاء بريد عشوائي
                        </button>
                        <button
                          onClick={() => setShowCustomForm(true)}
                          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition text-lg"
                        >
                          إنشاء بريد مخصص
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">ما هو البريد الإلكتروني المؤقت (مهمل)؟</h2>
          <p className="mb-4">
            البريد الإلكتروني المتاح - هي خدمة تسمح باستلام البريد الإلكتروني في عنوان مؤقت تم تدميره ذاتيًا بعد مرور فترة زمنية معينة. 
            وهي معروفة أيضًا بأسماء مثل: مهمل، أو البريد الإلكتروني، أو 10 دقائق، أو tempmail.
          </p>
          <p className="mb-4">
            تطلب العديد من المنتديات ومالكي Wi-Fi والمواقع الإلكترونية والمدونات من الزائرين التسجيل قبل أن يتمكنوا من عرض المحتوى أو نشر التعليقات أو تنزيل شيء ما.
            Temp-Mail - هي خدمة البريد الإلكتروني الأكثر تقدمًا التي تساعدك على تجنب البريد العشوائي والبقاء آمنًا.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-2 text-blue-600">مميزات البريد المؤقت</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>حماية خصوصية المستخدم فأغلب مزودات البريد المؤقت لا تطلب أية بيانات شخصية للحصول على بريد مؤقت.</li>
            <li>تفعيل الحسابات والخدمات التي تتطلب بريد إلكتروني للتسجيل.</li>
            <li>تجنب البريد المزعج والرسائل الإعلانية.</li>
            <li>الاستفادة من الفترات التجريبية المجانية للخدمات المختلفة.</li>
            <li>إنشاء حسابات متعددة على موقع معين.</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-2 text-blue-600">كيفية استخدام البريد المؤقت</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>قم بإنشاء بريد إلكتروني مؤقت عشوائي أو مخصص.</li>
            <li>استخدم هذا البريد للتسجيل في الموقع أو الخدمة التي تريدها.</li>
            <li>عد إلى صفحة صندوق الوارد لمشاهدة الرسائل الواردة.</li>
            <li>يمكنك تجديد صلاحية البريد إذا كنت بحاجة إلى مزيد من الوقت.</li>
            <li>عند الانتهاء، يمكنك حذف البريد أو تركه لينتهي تلقائيًا بعد 45 دقيقة.</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
