import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// واجهة برمجة التطبيقات لتجديد صلاحية البريد الإلكتروني المؤقت
export async function POST() {
  try {
    const cookieStore = cookies();
    const email = cookieStore.get('temp_email')?.value;
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'لا يوجد بريد إلكتروني مؤقت حالي'
      }, { status: 404 });
    }
    
    // تجديد صلاحية البريد الإلكتروني لمدة 45 دقيقة إضافية
    cookieStore.set('temp_email', email, {
      maxAge: 60 * 45, // 45 دقيقة
      path: '/',
    });
    
    // تحديث وقت انتهاء الصلاحية
    const expiryTime = Date.now() + (45 * 60 * 1000); // 45 دقيقة من الآن
    cookieStore.set('email_expiry', expiryTime.toString(), {
      maxAge: 60 * 45,
      path: '/',
    });
    
    // تجديد صلاحية صندوق البريد
    const inboxCookie = cookieStore.get('inbox')?.value;
    if (inboxCookie) {
      cookieStore.set('inbox', inboxCookie, {
        maxAge: 60 * 45,
        path: '/',
      });
    }
    
    return NextResponse.json({
      success: true,
      email,
      expiryTime,
      message: 'تم تجديد صلاحية البريد الإلكتروني المؤقت بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تجديد صلاحية البريد الإلكتروني:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء تجديد صلاحية البريد الإلكتروني المؤقت'
    }, { status: 500 });
  }
}
