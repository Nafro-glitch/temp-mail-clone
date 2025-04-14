import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// واجهة برمجة التطبيقات لتغيير البريد الإلكتروني المؤقت
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const cookieStore = await cookies();
    
    // نطاق البريد الإلكتروني المخصص
    const EMAIL_DOMAIN = 'mytempemail.com';
    
    // وظيفة لإنشاء اسم عشوائي للبريد الإلكتروني
    function generateRandomUsername(length: number = 8): string {
      const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const charactersLength = characters.length;
      
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      
      return result;
    }
    
    let newEmail = '';
    
    // إذا كان المستخدم يريد بريدًا عشوائيًا
    if (data.random) {
      const username = generateRandomUsername();
      newEmail = `${username}@${EMAIL_DOMAIN}`;
    } 
    // إذا كان المستخدم يريد بريدًا مخصصًا
    else if (data.username) {
      // التحقق من صحة اسم المستخدم
      const validUsername = data.username.replace(/[^a-z0-9]/gi, '').toLowerCase();
      newEmail = `${validUsername}@${EMAIL_DOMAIN}`;
    } 
    // إذا لم يتم تحديد أي خيار، إنشاء بريد عشوائي
    else {
      const username = generateRandomUsername();
      newEmail = `${username}@${EMAIL_DOMAIN}`;
    }
    
    // إنشاء كعكة لتخزين البريد الإلكتروني الجديد
    cookieStore.set('temp_email', newEmail, {
      maxAge: 60 * 45, // 45 دقيقة
      path: '/',
    });
    
    // إنشاء كعكة لتخزين وقت انتهاء الصلاحية
    const expiryTime = Date.now() + (45 * 60 * 1000); // 45 دقيقة من الآن
    cookieStore.set('email_expiry', expiryTime.toString(), {
      maxAge: 60 * 45,
      path: '/',
    });
    
    // إعادة تعيين صندوق البريد
    cookieStore.set('inbox', JSON.stringify([]), {
      maxAge: 60 * 45,
      path: '/',
    });
    
    return NextResponse.json({
      success: true,
      email: newEmail,
      expiryTime,
      message: 'تم تغيير البريد الإلكتروني المؤقت بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تغيير البريد الإلكتروني:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء تغيير البريد الإلكتروني المؤقت'
    }, { status: 500 });
  }
}
