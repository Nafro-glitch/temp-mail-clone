import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

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

// وظيفة لإنشاء بريد إلكتروني عشوائي
function generateRandomEmail(): string {
  const username = generateRandomUsername();
  return `${username}@${EMAIL_DOMAIN}`;
}

// وظيفة لإنشاء بريد إلكتروني مخصص
function createCustomEmail(username: string): string {
  // التحقق من صحة اسم المستخدم
  const validUsername = username.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return `${validUsername}@${EMAIL_DOMAIN}`;
}

// وظيفة لإنشاء معرف فريد للرسالة
function generateMessageId(): string {
  return crypto.randomUUID();
}

// وظيفة للحصول على الوقت الحالي بتنسيق ISO
function getCurrentTime(): string {
  return new Date().toISOString();
}

// واجهة برمجة التطبيقات لإنشاء بريد إلكتروني جديد
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    let email = '';
    
    // إذا كان المستخدم يريد بريدًا عشوائيًا
    if (data.random) {
      email = generateRandomEmail();
    } 
    // إذا كان المستخدم يريد بريدًا مخصصًا
    else if (data.username) {
      email = createCustomEmail(data.username);
    } 
    // إذا لم يتم تحديد أي خيار، إنشاء بريد عشوائي
    else {
      email = generateRandomEmail();
    }
    
    // إنشاء كعكة لتخزين البريد الإلكتروني
    const cookieStore = await cookies();
    cookieStore.set('temp_email', email, {
      maxAge: 60 * 45, // 45 دقيقة
      path: '/',
    });
    
    // إنشاء كعكة لتخزين وقت انتهاء الصلاحية
    const expiryTime = Date.now() + (45 * 60 * 1000); // 45 دقيقة من الآن
    cookieStore.set('email_expiry', expiryTime.toString(), {
      maxAge: 60 * 45,
      path: '/',
    });
    
    // إنشاء صندوق بريد فارغ
    cookieStore.set('inbox', JSON.stringify([]), {
      maxAge: 60 * 45,
      path: '/',
    });
    
    return NextResponse.json({
      success: true,
      email,
      expiryTime,
      message: 'تم إنشاء البريد الإلكتروني المؤقت بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إنشاء البريد الإلكتروني:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء البريد الإلكتروني المؤقت'
    }, { status: 500 });
  }
}

// واجهة برمجة التطبيقات للحصول على البريد الإلكتروني الحالي
export async function GET() {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get('temp_email')?.value;
    const expiryTime = cookieStore.get('email_expiry')?.value;
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'لا يوجد بريد إلكتروني مؤقت حالي'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      email,
      expiryTime: expiryTime ? parseInt(expiryTime) : null,
      message: 'تم استرجاع البريد الإلكتروني المؤقت بنجاح'
    });
  } catch (error) {
    console.error('خطأ في استرجاع البريد الإلكتروني:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء استرجاع البريد الإلكتروني المؤقت'
    }, { status: 500 });
  }
}

// واجهة برمجة التطبيقات لحذف البريد الإلكتروني الحالي
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    
    // حذف جميع الكعكات المتعلقة بالبريد الإلكتروني
    cookieStore.delete('temp_email');
    cookieStore.delete('email_expiry');
    cookieStore.delete('inbox');
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف البريد الإلكتروني المؤقت بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف البريد الإلكتروني:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء حذف البريد الإلكتروني المؤقت'
    }, { status: 500 });
  }
}
