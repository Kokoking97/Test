// ==========================================
// 1. استيراد الدوال الجاهزة من سيرفرات جوجل مباشرة
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile, reload, setPersistence, browserLocalPersistence, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ==========================================
// 2. بيانات مشروعك الخاصة بك (Firebase Config)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAZvTuUuylqJrbUP6qU3wP6QcVWXEQQ5G4",
  authDomain: "accounts-a7b33.firebaseapp.com",
  databaseURL: "https://accounts-a7b33-default-rtdb.firebaseio.com",
  projectId: "accounts-a7b33",
  storageBucket: "accounts-a7b33.firebasestorage.app",
  messagingSenderId: "329562554070",
  appId: "1:329562554070:web:55fe2c87d02c7debad5377",
  measurementId: "G-0X9Y34HT7G"
};

// 3. تشغيل الـ Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==========================================
// 🔥 الحارس الذكي: يفحص لو الشخص مسجل دخول ومفعل حسابه بالفعل ينقله فوراً للموقع
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
        const fullName = user.displayName || "مستخدم";
        window.location.href = `https://extraordinary-concha-54c7ca.netlify.app?name=${encodeURIComponent(fullName)}`;
    }
});

// ==========================================
// 4. التحكم في النافذة المنبثقة (Terms Modal)
// ==========================================
const termsModal = document.getElementById('termsModal');
const openTermsLink = document.getElementById('openTerms');
const closeTermsBtn = document.getElementById('closeTerms');

// أ- فتح النافذة عند الضغط على كلمة "الشروط والأحكام"
openTermsLink.addEventListener('click', function(event) {
    event.preventDefault(); 
    termsModal.style.display = 'flex'; 
});

// ب- إغلاق النافذة عند الضغط على علامة الـ X
closeTermsBtn.addEventListener('click', function() {
    termsModal.style.display = 'none'; 
});

// ج- ميزة إضافية: إغلاق النافذة إذا ضغط المستخدم في أي مكان فارغ خارج الصندوق الأبيض
window.addEventListener('click', function(event) {
    if (event.target === termsModal) {
        termsModal.style.display = 'none';
    }
});

// ==========================================
// 5. إدارة نموذج تسجيل الحساب الجديد والـ Firebase
// ==========================================
const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms');

    if (password !== confirmPassword) {
        alert("خطأ: كلمتا المرور غير متطابقتين!");
        return; 
    }
    if (password.length < 8) {
        alert("خطأ: يجب أن تكون كلمة المرور مكونة من 8 أحرف أو أكثر!");
        return;
    }
    if (!agreeTerms.checked) {
        alert("تنبيه: يجب عليك الموافقة على الشروط والأحكام أولاً للمتابعة! 📝");
        return;
    }

    try {
        // 🔥 التعديل السحري: إجبار المتصفح على تفعيل التذكر الدائم في بداية العملية تماماً
        await setPersistence(auth, browserLocalPersistence);

        // خطوة (1): إنشاء الحساب في نظام حماية Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // خطوة (2): حفظ اسم المستخدم الكامل داخل حسابه الجديد
        await updateProfile(user, { displayName: fullName });

        // خطوة (3): إرسال رسالة التفعيل إلى بريد المستخدم فوراً
        await sendEmailVerification(user);

        // خطوة (4): إظهار رسالة النجاح وتعديل الزر الأصلي ليتولى فحص التفعيل
        alert(`تم إنشاء الحساب بنجاح يا ${fullName}! 📨\n\nيرجى الذهاب لبريدك الإلكتروني والضغط على رابط التفعيل، ثم العودة إلى هنا والضغط على الزر بالأسفل للدخول للموقع.`);
        
        // تحويل زر الإرسال لزر فحص ذكي
        const submitBtn = registerForm.querySelector('.btn-submit');
        submitBtn.textContent = "🔄 تحقق من التفعيل والدخول للموقع";
        submitBtn.type = "button"; // تحويله لزر عادي لتعطيل الإرسال التقليدي للمتصفح
        
        // إضافة وظيفة التحقق الذكية عند الضغط على الزر المطور الجديد
        submitBtn.addEventListener('click', async function() {
            
            // حماية برمجية مضاعفة: التأكد من أن المستخدم لم يزل علامة الصح من المربع أثناء الانتظار
            if (!agreeTerms.checked) {
                alert("تنبيه: لا يمكنك الدخول دون الموافقة على الشروط والأحكام وسيصة الخصوصية! 📝");
                return; 
            }

            // تحديث بيانات المستخدم الحالية من سيرفر Firebase لمعرفة هل ضغط على الرابط في الجيميل أم لا
            await reload(auth.currentUser);
            const updatedUser = auth.currentUser;

            // إذا تفعّل الحساب بنجاح عن طريق الجيميل
            if (updatedUser.emailVerified) {
                alert(`تهانينا يا ${fullName}! تم تفعيل حسابك بنجاح. جاري توجيهك للموقع الرئيسي... 🎉`);
                
                // التوجيه الفوري للموقع الرسمي
                window.location.href = `https://extraordinary-concha-54c7ca.netlify.app?name=${encodeURIComponent(fullName)}`;
            } else {
                // إذا عاد وضغط على الزر دون تفعيل الرابط في بريده
                alert("تنبيه: يبدو أنك لم تقم بالضغط على رابط التفعيل في بريدك الإلكتروني بعد! يرجى التحقق من صندوق الوارد أو البريد غير الهام (Spam).");
            }
        });

    } catch (error) {
        console.error("حدث خطأ أثناء التسجيل:", error.code);
        
        // تخصيص رسائل الخطأ للمستخدم بناءً على رد سيرفر Firebase
        if (error.code === 'auth/email-already-in-use') {
            alert("خطأ: هذا البريد الإلكتروني مسجل بالفعل لدى مستخدم آخر!");
        } else if (error.code === 'auth/invalid-email') {
            alert("خطأ: صيغة البريد الإلكتروني غير صحيحة!");
        } else if (error.code === 'auth/weak-password') {
            alert("خطأ: كلمة المرور ضعيفة جداً برمجياً!");
        } else {
            alert(`فشل التسجيل: ${error.message}`);
        }
    }
});
