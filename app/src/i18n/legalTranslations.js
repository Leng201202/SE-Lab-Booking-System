export const legalTranslations = {
  en: {
    navigationLabel: 'Privacy and terms',
    backToSignIn: 'Back to sign in',
    draftNotice: 'Draft for review: this document describes the current project. It has not been approved as a university policy. Institutional retention rules and privacy contact details are awaiting confirmation.',
    privacy: {
      title: 'Privacy Policy',
      introduction: 'This draft explains how the SE Lab PC Booking System at Mae Fah Luang University handles information when you sign in, request a computer, or review and manage bookings.',
      sections: [
        {
          title: 'Information collected',
          paragraphs: [
            'Google sign-in provides identity information used to authenticate your account, including your name, email address, and account identifier. The application profile stores your name, email, university ID when available, application role, Advisor assignment, and profile timestamps.',
            'For Students with a 10-digit numeric @lamduan.mfu.ac.th email address, the system derives the university ID from the email. Other Students can submit a 10-digit ID; a manually entered ID is self-declared and is not proof of university verification.',
            'Booking records include the requester, assigned reviewers, selected PC, dates and times, access mode, purpose, course, status, and timestamps. Review history records the reviewer, decision, time, and any rejection reason. Cancellation records include the reason, requester, and time.',
          ],
        },
        {
          title: 'How information is used',
          paragraphs: [
            'Information is used to authenticate users, apply role permissions, assign Advisors, check availability, process booking requests, support reviews and cancellations, and administer users and lab PCs. Booking and review history helps explain decisions and preserve accountability.',
            'Provide only information needed for your request. Avoid placing passwords or unrelated sensitive personal information in booking purposes, course details, or reasons.',
          ],
        },
        {
          title: 'Who can access information',
          paragraphs: [
            'Signed-in users can access their own private bookings. Technicians can review Student requests at the technical stage and access their technical review history. Advisors can access assigned Students’ bookings and review eligible requests. Deans can access final-review records and profiles needed for user management. Access depends on the database role and applicable policies.',
            'The shared calendar shows occupancy information without Student identity, university ID, booking purpose, course, or rejection details. Anonymous users cannot read the application tables.',
          ],
        },
        {
          title: 'Storage and service providers',
          paragraphs: [
            'The project uses Supabase Auth for authentication and a Supabase PostgreSQL database for profiles, bookings, PC inventory, and review history. Google handles Google account sign-in. Each provider also processes information needed to operate its service under its own policies.',
            'The browser persists the Supabase authentication session so it can restore sign-in, and stores your English or Thai preference under se-lab-language in local storage. Booking records are stored in the database rather than browser local storage.',
          ],
        },
        {
          title: 'Implemented protection measures',
          paragraphs: [
            'Supabase Auth authenticates users. Database grants and Row Level Security restrict access, and database functions check the acting user and role for booking and management operations. Users cannot grant themselves application roles. Approval and rejection events are append-only application records.',
            'These measures describe the current implementation and do not guarantee that every risk is eliminated. This draft does not claim that additional planned security controls are already implemented.',
          ],
        },
        {
          title: 'Retention and privacy enquiries',
          paragraphs: [
            'The university has not yet confirmed a retention schedule, deletion process, or privacy contact for this project. Booking cancellation changes the booking status and retains its history; it does not delete the record. No automatic deletion deadline or deletion guarantee is stated in this draft.',
            'An approved privacy contact and the process for requesting access, correction, or deletion must be added after institutional confirmation.',
          ],
        },
      ],
    },
    terms: {
      title: 'Terms of Service',
      introduction: 'These draft terms describe expected use of the SE Lab PC Booking System and its current booking rules. They are provided for review and do not establish an approved university policy.',
      sections: [
        {
          title: 'Account information and security',
          paragraphs: [
            'Use your own Google account and provide accurate identity and booking information. Do not impersonate another person, share your authenticated session, or submit someone else’s university ID. Protect your Google account and sign out when using a shared computer.',
            'New profiles begin as Students. Authorized administrators manage elevated roles, and Advisors or Deans manage Advisor assignments within their permissions. Signing in does not let you choose or grant yourself a privileged role.',
          ],
        },
        {
          title: 'Responsible lab use',
          paragraphs: [
            'Use lab PCs responsibly for academic work and follow applicable university lab instructions. Respect other users, equipment, and the time reserved for your approved booking.',
            'Do not attempt unauthorized access, bypass permissions, misuse personal information, damage equipment, distribute malicious software, or disrupt the booking service.',
          ],
        },
        {
          title: 'Booking availability and times',
          paragraphs: [
            'Requests must start in the future, select an available PC, and include a purpose of at least five non-whitespace characters. Students need an assigned Advisor before creating a request.',
            'One-day in-lab bookings must stay on one date between 08:00 and 18:00, with the end after the start. Multi-day bookings use remote access and reserve the full inclusive date range. Times are displayed in Asia/Bangkok.',
            'Pending and approved bookings reserve their interval, and overlapping active bookings for the same PC are rejected. PCs marked for maintenance or inactive cannot receive new bookings. Availability shown on screen may change before a request is submitted.',
          ],
        },
        {
          title: 'Reviews and approval',
          paragraphs: [
            'Student requests proceed through Technician, assigned Advisor, and Dean review. Technician requests proceed through Advisor and Dean review. Advisor requests proceed to Dean review. Dean requests are approved immediately after availability validation.',
            'A submitted request is not an approved booking until the required reviews are complete. Reviewers can approve or reject eligible requests, and rejection requires a reason. Do not assume that a pending request authorizes lab use.',
          ],
        },
        {
          title: 'Cancellation and records',
          paragraphs: [
            'Users in every role may cancel only their own active booking before it starts. Cancellation requires a trimmed reason of 5–2000 characters and releases the reserved interval.',
            'Cancellation and review details remain part of booking history. Cancelling a booking does not delete your account or its records.',
          ],
        },
        {
          title: 'Privacy and pending institutional details',
          paragraphs: [
            'Read the Privacy Policy for the information collected, its uses, storage, and role-based access. The university’s retention rules, privacy contact, and any further approved usage conditions are awaiting confirmation.',
          ],
        },
      ],
    },
  },
  th: {
    navigationLabel: 'ความเป็นส่วนตัวและข้อกำหนด',
    backToSignIn: 'กลับไปหน้าเข้าสู่ระบบ',
    draftNotice: 'ฉบับร่างเพื่อพิจารณา: เอกสารนี้อธิบายโครงการในปัจจุบัน ยังไม่ได้รับการอนุมัติให้เป็นนโยบายของมหาวิทยาลัย ระยะเวลาเก็บรักษาข้อมูลและช่องทางติดต่อด้านความเป็นส่วนตัวอยู่ระหว่างรอการยืนยันจากมหาวิทยาลัย',
    privacy: {
      title: 'นโยบายความเป็นส่วนตัว',
      introduction: 'ฉบับร่างนี้อธิบายการจัดการข้อมูลของระบบจองเครื่องคอมพิวเตอร์ห้องปฏิบัติการวิศวกรรมซอฟต์แวร์ มหาวิทยาลัยแม่ฟ้าหลวง เมื่อคุณเข้าสู่ระบบ ขอจองเครื่อง ตรวจสอบ หรือจัดการการจอง',
      sections: [
        {
          title: 'ข้อมูลที่เก็บรวบรวม',
          paragraphs: [
            'การเข้าสู่ระบบด้วย Google ให้ข้อมูลระบุตัวตนสำหรับยืนยันบัญชี เช่น ชื่อ อีเมล และตัวระบุบัญชี โปรไฟล์ในระบบเก็บชื่อ อีเมล รหัสประจำตัวมหาวิทยาลัยเมื่อมีข้อมูล บทบาท อาจารย์ที่ปรึกษาที่ได้รับมอบหมาย และเวลาสร้างหรือแก้ไขโปรไฟล์',
            'สำหรับนักศึกษาที่ใช้อีเมล @lamduan.mfu.ac.th ซึ่งมีส่วนหน้าของอีเมลเป็นตัวเลข 10 หลัก ระบบจะนำตัวเลขนั้นมาเป็นรหัสนักศึกษา นักศึกษารายอื่นสามารถกรอกรหัส 10 หลักได้ รหัสที่กรอกเองเป็นข้อมูลที่ผู้ใช้แจ้งและไม่ได้ยืนยันการตรวจสอบโดยมหาวิทยาลัย',
            'ข้อมูลการจองประกอบด้วยผู้ขอจอง ผู้ตรวจสอบที่ได้รับมอบหมาย เครื่องคอมพิวเตอร์ วันที่และเวลา รูปแบบการเข้าถึง วัตถุประสงค์ รายวิชา สถานะ และเวลาบันทึก ประวัติการตรวจสอบเก็บผู้ตรวจสอบ ผลการพิจารณา เวลา และเหตุผลที่ปฏิเสธเมื่อมีการปฏิเสธ ข้อมูลการยกเลิกเก็บเหตุผล ผู้ยกเลิก และเวลา',
          ],
        },
        {
          title: 'การใช้ข้อมูล',
          paragraphs: [
            'ระบบใช้ข้อมูลเพื่อยืนยันตัวตน กำหนดสิทธิ์ตามบทบาท มอบหมายอาจารย์ที่ปรึกษา ตรวจสอบช่วงเวลาว่าง ดำเนินการจอง พิจารณาคำขอ ยกเลิกการจอง และจัดการผู้ใช้กับเครื่องคอมพิวเตอร์ ประวัติการจองและการพิจารณาช่วยอธิบายการตัดสินใจและตรวจสอบความรับผิดชอบ',
            'ระบุเฉพาะข้อมูลที่จำเป็นต่อคำขอ หลีกเลี่ยงการใส่รหัสผ่านหรือข้อมูลส่วนบุคคลที่ละเอียดอ่อนซึ่งไม่เกี่ยวข้องในวัตถุประสงค์ รายวิชา หรือเหตุผลต่าง ๆ',
          ],
        },
        {
          title: 'ผู้ที่เข้าถึงข้อมูลได้',
          paragraphs: [
            'ผู้ใช้ที่เข้าสู่ระบบสามารถเข้าถึงการจองส่วนตัวของตนเอง ช่างเทคนิคตรวจสอบคำขอของนักศึกษาในขั้นตอนทางเทคนิคและเข้าถึงประวัติการตรวจสอบของตน อาจารย์ที่ปรึกษาเข้าถึงการจองของนักศึกษาที่อยู่ในความดูแลและพิจารณาคำขอที่มีสิทธิ์ คณบดีเข้าถึงข้อมูลสำหรับการพิจารณาขั้นสุดท้ายและโปรไฟล์ที่จำเป็นต่อการจัดการผู้ใช้ การเข้าถึงขึ้นอยู่กับบทบาทและนโยบายในฐานข้อมูล',
            'ปฏิทินส่วนกลางแสดงข้อมูลช่วงเวลาที่มีการจองโดยไม่แสดงตัวตนนักศึกษา รหัสประจำตัวมหาวิทยาลัย วัตถุประสงค์ รายวิชา หรือรายละเอียดการปฏิเสธ ผู้ที่ยังไม่ได้เข้าสู่ระบบไม่สามารถอ่านตารางข้อมูลของแอปพลิเคชันได้',
          ],
        },
        {
          title: 'การจัดเก็บและผู้ให้บริการ',
          paragraphs: [
            'โครงการใช้ Supabase Auth สำหรับยืนยันตัวตน และฐานข้อมูล Supabase PostgreSQL สำหรับโปรไฟล์ การจอง รายการเครื่องคอมพิวเตอร์ และประวัติการพิจารณา Google เป็นผู้ให้บริการเข้าสู่ระบบบัญชี Google ผู้ให้บริการแต่ละรายประมวลผลข้อมูลที่จำเป็นต่อบริการของตนภายใต้นโยบายของตนเองด้วย',
            'เบราว์เซอร์เก็บเซสชันยืนยันตัวตนของ Supabase เพื่อให้กลับเข้าสู่ระบบได้ และเก็บภาษาที่เลือกไว้ใน local storage ภายใต้ชื่อ se-lab-language ข้อมูลการจองถูกเก็บในฐานข้อมูล ไม่ได้เก็บใน local storage ของเบราว์เซอร์',
          ],
        },
        {
          title: 'มาตรการปกป้องที่ใช้งานแล้ว',
          paragraphs: [
            'Supabase Auth ยืนยันตัวตนผู้ใช้ สิทธิ์ฐานข้อมูลและ Row Level Security จำกัดการเข้าถึง ฟังก์ชันฐานข้อมูลตรวจสอบผู้ดำเนินการและบทบาทสำหรับการจองและการจัดการ ผู้ใช้ไม่สามารถเพิ่มสิทธิ์บทบาทให้ตนเองได้ บันทึกเหตุการณ์อนุมัติและปฏิเสธเป็นประวัติที่แอปพลิเคชันเพิ่มได้โดยไม่แก้ไขย้อนหลัง',
            'มาตรการเหล่านี้อธิบายระบบที่ใช้งานในปัจจุบันและไม่ได้รับประกันว่าจะขจัดความเสี่ยงทั้งหมด ฉบับร่างนี้ไม่ได้อ้างว่ามาตรการเพิ่มเติมที่อยู่ในแผนพัฒนาได้ถูกใช้งานแล้ว',
          ],
        },
        {
          title: 'การเก็บรักษาและการติดต่อด้านความเป็นส่วนตัว',
          paragraphs: [
            'มหาวิทยาลัยยังไม่ได้ยืนยันระยะเวลาเก็บรักษา ขั้นตอนการลบข้อมูล หรือช่องทางติดต่อด้านความเป็นส่วนตัวสำหรับโครงการนี้ การยกเลิกการจองเปลี่ยนสถานะและยังคงเก็บประวัติ ไม่ได้ลบบันทึก ฉบับร่างนี้ไม่ได้กำหนดเวลาลบอัตโนมัติหรือรับประกันการลบข้อมูล',
            'ช่องทางติดต่อที่ได้รับอนุมัติและขั้นตอนการขอเข้าถึง แก้ไข หรือลบข้อมูลจะต้องเพิ่มภายหลังการยืนยันจากมหาวิทยาลัย',
          ],
        },
      ],
    },
    terms: {
      title: 'ข้อกำหนดการใช้บริการ',
      introduction: 'ข้อกำหนดฉบับร่างนี้อธิบายการใช้งานที่คาดหวังและกฎการจองปัจจุบันของระบบจองเครื่องคอมพิวเตอร์ห้องปฏิบัติการวิศวกรรมซอฟต์แวร์ จัดทำเพื่อพิจารณาและยังไม่ได้เป็นนโยบายที่มหาวิทยาลัยอนุมัติ',
      sections: [
        {
          title: 'ข้อมูลบัญชีและความปลอดภัย',
          paragraphs: [
            'ใช้บัญชี Google ของตนเองและให้ข้อมูลตัวตนกับข้อมูลการจองที่ถูกต้อง ห้ามแอบอ้างบุคคลอื่น แชร์เซสชันที่เข้าสู่ระบบแล้ว หรือใช้รหัสประจำตัวมหาวิทยาลัยของผู้อื่น ดูแลบัญชี Google และออกจากระบบเมื่อใช้คอมพิวเตอร์ร่วมกับผู้อื่น',
            'โปรไฟล์ใหม่เริ่มต้นด้วยบทบาทนักศึกษา ผู้ดูแลที่มีสิทธิ์จัดการบทบาทระดับสูง อาจารย์ที่ปรึกษาหรือคณบดีจัดการการมอบหมายอาจารย์ที่ปรึกษาตามสิทธิ์ของตน การเข้าสู่ระบบไม่ได้ให้สิทธิ์เลือกหรือเพิ่มบทบาทระดับสูงให้ตนเอง',
          ],
        },
        {
          title: 'การใช้ห้องปฏิบัติการอย่างรับผิดชอบ',
          paragraphs: [
            'ใช้เครื่องคอมพิวเตอร์อย่างรับผิดชอบเพื่อการศึกษาและปฏิบัติตามคำแนะนำของห้องปฏิบัติการมหาวิทยาลัย เคารพผู้ใช้คนอื่น อุปกรณ์ และช่วงเวลาการจองที่ได้รับอนุมัติ',
            'ห้ามเข้าถึงระบบโดยไม่ได้รับอนุญาต ข้ามการตรวจสอบสิทธิ์ ใช้ข้อมูลส่วนบุคคลในทางที่ผิด ทำให้อุปกรณ์เสียหาย เผยแพร่ซอฟต์แวร์อันตราย หรือรบกวนระบบจอง',
          ],
        },
        {
          title: 'ช่วงเวลาว่างและกฎการจอง',
          paragraphs: [
            'คำขอต้องเริ่มในอนาคต เลือกเครื่องที่พร้อมใช้งาน และระบุวัตถุประสงค์อย่างน้อย 5 ตัวอักษรที่ไม่ใช่ช่องว่าง นักศึกษาต้องมีอาจารย์ที่ปรึกษาที่ได้รับมอบหมายก่อนสร้างคำขอ',
            'การจองใช้งานในห้องปฏิบัติการแบบวันเดียวต้องอยู่ในวันเดียวกัน ระหว่าง 08:00–18:00 และเวลาสิ้นสุดต้องหลังเวลาเริ่ม การจองหลายวันใช้รูปแบบเข้าถึงระยะไกลและจองเต็มทุกวันตั้งแต่วันแรกถึงวันสุดท้าย เวลาแสดงตามเขตเวลา Asia/Bangkok',
            'คำขอที่รอพิจารณาและการจองที่อนุมัติแล้วจะกันช่วงเวลาไว้ ระบบปฏิเสธการจองที่ยังมีผลและทับซ้อนบนเครื่องเดียวกัน เครื่องที่อยู่ระหว่างบำรุงรักษาหรือปิดใช้งานไม่สามารถรับการจองใหม่ได้ ช่วงเวลาว่างที่แสดงอาจเปลี่ยนก่อนส่งคำขอ',
          ],
        },
        {
          title: 'การพิจารณาและการอนุมัติ',
          paragraphs: [
            'คำขอของนักศึกษาผ่านช่างเทคนิค อาจารย์ที่ปรึกษาที่ได้รับมอบหมาย และคณบดี คำขอของช่างเทคนิคผ่านอาจารย์ที่ปรึกษาและคณบดี คำขอของอาจารย์ที่ปรึกษาผ่านคณบดี คำขอของคณบดีได้รับอนุมัติทันทีหลังผ่านการตรวจสอบช่วงเวลาว่าง',
            'การส่งคำขอยังไม่ใช่การจองที่ได้รับอนุมัติจนกว่าจะผ่านขั้นตอนพิจารณาที่จำเป็น ผู้ตรวจสอบสามารถอนุมัติหรือปฏิเสธคำขอที่ตนมีสิทธิ์ โดยการปฏิเสธต้องระบุเหตุผล อย่าถือว่าคำขอที่รอพิจารณาเป็นการอนุญาตให้ใช้ห้องปฏิบัติการ',
          ],
        },
        {
          title: 'การยกเลิกและประวัติ',
          paragraphs: [
            'ผู้ใช้ทุกบทบาทยกเลิกได้เฉพาะการจองของตนเองที่ยังมีผลและยังไม่ถึงเวลาเริ่ม ต้องระบุเหตุผลยาว 5–2000 ตัวอักษรหลังตัดช่องว่างหัวท้าย การยกเลิกทำให้ช่วงเวลาที่จองไว้กลับมาว่าง',
            'รายละเอียดการยกเลิกและการพิจารณายังคงอยู่ในประวัติการจอง การยกเลิกไม่ได้ลบบัญชีหรือบันทึกของคุณ',
          ],
        },
        {
          title: 'ความเป็นส่วนตัวและรายละเอียดที่รอยืนยัน',
          paragraphs: [
            'อ่านนโยบายความเป็นส่วนตัวเพื่อทราบข้อมูลที่เก็บ การใช้งาน การจัดเก็บ และการเข้าถึงตามบทบาท ระยะเวลาเก็บรักษา ช่องทางติดต่อด้านความเป็นส่วนตัว และเงื่อนไขเพิ่มเติมที่ได้รับอนุมัติยังอยู่ระหว่างรอการยืนยันจากมหาวิทยาลัย',
          ],
        },
      ],
    },
  },
}
