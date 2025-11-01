# ایجاد درخواست‌های تستی

برای ایجاد درخواست‌های تستی، مراحل زیر را دنبال کنید:

## راه حل 1: استفاده از Endpoint تست (پیشنهادی)

1. **مطمئن شوید سرور در حال اجراست**:
   ```bash
   npm run dev
   ```

2. **Prisma Client را generate کنید** (اگر هنوز انجام نشده):
   - سرور را متوقف کنید (Ctrl+C)
   - اجرا کنید: `npx prisma generate`
   - دوباره سرور را start کنید: `npm run dev`

3. **درخواست‌های تستی را ایجاد کنید**:
   ```bash
   node create-test-requests.js
   ```

   یا مستقیماً از مرورگر یا Postman:
   ```
   POST http://localhost:3001/api/requests/test/create
   ```

## راه حل 2: ایجاد دستی از طریق API

می‌توانید از Postman یا curl استفاده کنید:

```bash
curl -X POST http://localhost:3001/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "type": "leave",
    "employeeName": "علی احمدی",
    "employeePosition": "بازاریاب",
    "leaveStartDate": "2024-12-20",
    "leaveEndDate": "2024-12-22",
    "leaveDays": 3,
    "leaveReason": "مسافرت شخصی",
    "leaveType": "annual"
  }'
```

## درخواست‌های تستی ایجاد شده

اسکریپت `create-test-requests.js` 7 درخواست تستی ایجاد می‌کند:

1. **مرخصی علی احمدی** - pending (3 روز)
2. **مرخصی مریم رضایی** - pending (1 روز)
3. **مرخصی حسن کریمی** - approved (3 روز) ✅
4. **مرخصی فاطمه محمدی** - rejected (1 روز) ❌
5. **معرفی نامه علی احمدی** - pending (وام مسکن)
6. **معرفی نامه مریم رضایی** - approved ✅
7. **معرفی نامه حسن کریمی** - rejected ❌

## مشاهده درخواست‌ها

بعد از ایجاد درخواست‌ها، به این آدرس مراجعه کنید:
```
http://localhost:3001/admin/requests
```

