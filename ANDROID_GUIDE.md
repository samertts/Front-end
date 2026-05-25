# دليل تشغيل وتطوير نسخة أندرويد | GULA OS Android Mobile Guide

لقد قمنا بنجاح بتهيئة وتجهيز بيئة العمل الخاصة بالهواتف المحمولة وتلقيم مشروع **أندرويد أصيل (Native Android) باستخدام Capacitor** لربط واجهة React وتكاملاتها السيادية مباشرة مع نظام أندرويد.

---

## 📱 محتويات ومكونات حزمة الأندرويد المجهزة
1. **دليل الكود المحلي لأندرويد (`/android`)**: يحتوي على كود Java/Kotlin الأصيل ومجلدات الإعدادات والـ Gradle لبناء التطبيق مباشرة على أندرويد ستوديو.
2. **ملف الإعدادات الأساسي (`capacitor.config.ts`)**: يحمل معرف الحزمة السيادي `com.gula.sovereign` واسم التطبيق `Gula Sovereign OS`.
3. **سكربتات البناء والمزامنة المدمجة (`package.json`)**:
   - `npm run android:build`: لتصدير ملفات الويب ومزامنتها فوراً مع مجلد أصول أندرويد الأصيلة.
   - `npm run android:copy`: لتحديث أكواد الواجهة ونسخها لمجلد أصول أندرويد دون إعادة بناء الأجهزة الإضافية.

---

## 🛠️ كيف تبني وتصدر نسخة التطبيق (APK) للأجهزة اللوحية والسامسونج؟

لتصدير التطبيق وتثبيته على الهواتف أو إرساله للفريق الطبي في الميدان، اتبع الخطوات التالية:

### 1. تثبيت أندرويد ستوديو (Android Studio)
تأكد من تنزيل وتثبيت أحدث نسخة من [Android Studio](https://developer.android.com/studio) على جهاز التطوير لتوفير الـ SDK والـ Gradle Compiler اللازمين.

### 2. تجهيز كود الواجهة ومزامنته (قد قمنا بهذه الخطوة لك بنجاح 🎉)
لقد قمنا فعلياً ببناء ملفات الإنتاج ومزامنتها، ولكن مستقبلاً عند تحديث أي كود في واجهات التطبيق، قم بتشغيل الأمر التالي:
```bash
npm run android:build
```

### 3. فتح المشروع في أندرويد ستوديو وبنائه
قم بتشغيل الأمر التالي لفتح مجلد أندرويد مباشرة في تطبيق أندرويد ستوديو:
```bash
npx cap open android
```
*(أو يمكنك تعيين مسار مجلد `/android` مباشرة كـ "Open Project" في أندرويد ستوديو)*.

### 4. تصدير ملف الـ APK (Build APK)
داخل واجهة أندرويد ستوديو:
1. اذهب إلى القائمة العلوية واقصد **Build** ثم اختر **Build Bundle(s) / APK(s)** ثم انقر على **Build APK(s)**.
2. بمجرد انتهاء التجميع، سيظهر إشعار في الحافة السفلية يعلمك بانتهاء البناء مع زر **Locate** لفتح المجلد الذي يحتوي على ملف `app-debug.apk`.
3. قم بنقل هذا الملف وتثبيته مباشرة على أي هاتف أندرويد أو جهاز لوحي ميداني.

---

## 📶 مميزات التطبيق الداعمة للسيادة الطبية العراقية (Sovereignty & Offline-First)

* ✔️ **العمل دون اتصال التام (Autonomous Offline Mode)**: يستند التطبيق إلى قاعدة بيانات IndexedDB محلية لتخزين كل معاملات السجلات والتحاميل والتحاليل الطبية محلياً في ذاكرة هاتف الأندرويد في حال انقطاع الإنترنت أو العمل في مناطق ريفية نائية، مع مزامنة أحادية الاتجاه فور استعادة الشبكة للـ Gula Core.
* ✔️ **تكامل البصمات الحيوية (LoA3 Biometrics)**: يدعم التطبيق استدعاء مستشعر البصمة بالإصبع وقزحية العين (iris) الخاص بجهاز الأندرويد عبر معايير WebAuthn/FIDO بمجرد تفعيله لتأمين السجلات الطبية.
* ✔️ **التحقق من الباركود بواسطة الكاميرا (Camera Barcode Extraction)**: يدعم التطبيق فتح كاميرا أندرويد لمسح رمز الـ QR وعينات المختبر بدقة فائقة وبشكل آمن تماماً.

---

# English Reference Section

We have successfully scaffolded and verified a production-ready **Native Android deployment target** using **Capacitor** integration.

### Core Configuration Added:
- **Application Bundle ID**: `com.gula.sovereign`
- **Application Display Name**: `Gula Sovereign OS`
- **Root Directory**: Located at `/android`

### Quick Developer Commands:
1. **Build Web App & Sync to Android**:
   ```bash
   npm run android:build
   ```
2. **Open Android Project in Android Studio**:
   ```bash
   npx cap open android
   ```
3. **Assemble APK directly via Gradle (CLI alternative)**:
   ```bash
   cd android && ./gradlew assembleDebug
   ```
   The output APK will be output at `android/app/build/outputs/apk/debug/app-debug.apk`.
