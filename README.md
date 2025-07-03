ระบบ DRG Seeker
---------------

# หลักการ
`
  เป็นระบบช่วยในการคำนวณหาค่า DRG ตามมาตรฐานของกระทรวงสาธารณสุข
`

# ขั้นตอน
```
1.ติดตั้ง TGrouper จาก website https://www.tcmc.or.th/download-tcmc ทั้ง version 5 และ 6
2.การติดตั้ง API
  2.1 ติดตั้ง nodejs version 20 ขึ้นไป จาก website ของ nodejs หรือ nvm
  2.2 ติดตั้ง package ที่จำเป็นด้วยคำสั่ง npm install -g typescript ts-node pm2
  2.3 ติดตั้ง source code หรือ download จาก github นี้
  2.4 ติดตั้ง package ด้วยคำสั่ง npm install
  2.5 compile source ด้วยคำสั่ง tsc
  2.6 copy file env.example ไปเป็น file .env และแก้ไขตำแหน่งของ file ให้ถูกต้อง ตามที่ติดตั้งในข้อ 1.
  2.7 Start API ด้วยคำสั่ง pm2 start dist/server.js -i 2 --name "seeker"
  2.8 Test API ด้วย http://<ip เครื่องที่ติดตั้ง>:<port ที่กำหนดใน file .env>
3.การเรียกใช้งาน
  3.1 เตรียมข้อมูลในรูปแบบ json โดยมี column ตามมาตรฐาน drg เช่น pdx, sdx1-12, proc1-20 เป็นต้น
  3.2 call ด้วย POST http://<ip เครื่องที่ติดตั้ง>:<port ที่กำหนดใน file .env>/seeker ตัวแปร data
  3.2 ตัวแปรที่ส่งไปยัง API
    3.2.1 data ตาม column ของ dbf ที่ใช้คำนวน โดยส่งค่าเป็น array of object ทั้งนี้ควรส่งไม่เกิน 100 rows (สามารถดูจาก drgColumn ใน src/middleware/utils.ts)
    3.2.2 version ระบุ '5' หรือ '6'
  3.3 ระบบจะ return ค่า status, data และ tgrp ที่ใช้คำนวณ
```
