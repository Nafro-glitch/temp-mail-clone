import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// واجهة لتمثيل الرسالة
interface Message {
  id: string;
  from: string;
  subject: string;
  content: string;
  receivedAt: string;
  read: boolean;
}

// وظيفة لإنشاء رسالة ترحيبية
function createWelcomeMessage(): Message {
  return {
    id: crypto.randomUUID(),
    from: 'welcome@mytempemail.com',
    subject: 'مرحباً بك في خدمة البريد المؤقت',
    content: 'مرحباً بك في خدمة البريد المؤقت! يمكنك استخدام هذا البريد للتسجيل في المواقع والخدمات المختلفة دون الكشف عن بريدك الشخصي.',
    receivedAt: new Date().toISOString(),
    read: false
  };
}

// واجهة برمجة التطبيقات للحصول على الرسائل
export async function GET() {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get('temp_email')?.value;
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'لا يوجد بريد إلكتروني مؤقت حالي'
      }, { status: 404 });
    }
    
    // الحصول على صندوق البريد من الكوكيز
    let inbox: Message[] = [];
    const inboxCookie = cookieStore.get('inbox')?.value;
    
    if (inboxCookie) {
      inbox = JSON.parse(inboxCookie);
    } else {
      // إذا لم يكن هناك صندوق بريد، إنشاء رسالة ترحيبية
      inbox = [createWelcomeMessage()];
      cookieStore.set('inbox', JSON.stringify(inbox), {
        maxAge: 60 * 45, // 45 دقيقة
        path: '/',
      });
    }
    
    return NextResponse.json({
      success: true,
      messages: inbox,
      message: 'تم استرجاع الرسائل بنجاح'
    });
  } catch (error) {
    console.error('خطأ في استرجاع الرسائل:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء استرجاع الرسائل'
    }, { status: 500 });
  }
}

// واجهة برمجة التطبيقات لإضافة رسالة جديدة (محاكاة استلام رسالة)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get('temp_email')?.value;
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'لا يوجد بريد إلكتروني مؤقت حالي'
      }, { status: 404 });
    }
    
    const data = await request.json();
    
    // التحقق من وجود البيانات المطلوبة
    if (!data.from || !data.subject || !data.content) {
      return NextResponse.json({
        success: false,
        message: 'البيانات غير مكتملة'
      }, { status: 400 });
    }
    
    // إنشاء رسالة جديدة
    const newMessage: Message = {
      id: crypto.randomUUID(),
      from: data.from,
      subject: data.subject,
      content: data.content,
      receivedAt: new Date().toISOString(),
      read: false
    };
    
    // الحصول على صندوق البريد الحالي
    let inbox: Message[] = [];
    const inboxCookie = cookieStore.get('inbox')?.value;
    
    if (inboxCookie) {
      inbox = JSON.parse(inboxCookie);
    }
    
    // إضافة الرسالة الجديدة
    inbox.unshift(newMessage); // إضافة في بداية المصفوفة
    
    // تحديث صندوق البريد في الكوكيز
    cookieStore.set('inbox', JSON.stringify(inbox), {
      maxAge: 60 * 45, // 45 دقيقة
      path: '/',
    });
    
    return NextResponse.json({
      success: true,
      message: 'تم إضافة الرسالة بنجاح',
      newMessage
    });
  } catch (error) {
    console.error('خطأ في إضافة الرسالة:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء إضافة الرسالة'
    }, { status: 500 });
  }
}

// واجهة برمجة التطبيقات لتحديث حالة قراءة الرسالة
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get('temp_email')?.value;
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'لا يوجد بريد إلكتروني مؤقت حالي'
      }, { status: 404 });
    }
    
    const data = await request.json();
    
    // التحقق من وجود معرف الرسالة
    if (!data.messageId) {
      return NextResponse.json({
        success: false,
        message: 'معرف الرسالة مطلوب'
      }, { status: 400 });
    }
    
    // الحصول على صندوق البريد الحالي
    let inbox: Message[] = [];
    const inboxCookie = cookieStore.get('inbox')?.value;
    
    if (inboxCookie) {
      inbox = JSON.parse(inboxCookie);
    } else {
      return NextResponse.json({
        success: false,
        message: 'صندوق البريد فارغ'
      }, { status: 404 });
    }
    
    // البحث عن الرسالة وتحديث حالة القراءة
    const messageIndex = inbox.findIndex(msg => msg.id === data.messageId);
    
    if (messageIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'الرسالة غير موجودة'
      }, { status: 404 });
    }
    
    inbox[messageIndex].read = true;
    
    // تحديث صندوق البريد في الكوكيز
    cookieStore.set('inbox', JSON.stringify(inbox), {
      maxAge: 60 * 45, // 45 دقيقة
      path: '/',
    });
    
    return NextResponse.json({
      success: true,
      message: 'تم تحديث حالة قراءة الرسالة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث حالة قراءة الرسالة:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء تحديث حالة قراءة الرسالة'
    }, { status: 500 });
  }
}
