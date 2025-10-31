

import { Student, Teacher, Staff, Class, AttendanceRecord, Invoice, ProgressReport, Income, Expense, CenterSettings, UserRole, SalaryType, Announcement, Transaction, PersonStatus, FeeType, AttendanceStatus, TransactionType, Payroll } from '../types';

export const MOCK_STUDENTS: Student[] = [
    {
      "id": "HS001", "name": "Hoàng Thị Xuân", "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE, "dob": "2013-01-01",
      "parentName": "Đào Thị Xuyến", "address": "", "balance": 0, "email": "hs001@example.com", "phone": "0372624435"
    },
    {
      "id": "HS002", "email": "hs002@example.com", "address": "", "parentName": "Đỗ Thị Ngọ", "balance": 0,
      "createdAt": "2025-10-19", "phone": "0868899158", "dob": "2013-01-01", "name": "Lê Gia Bảo", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS003", "status": PersonStatus.ACTIVE, "parentName": "Hoàng Thị Liên", "name": "Đào Quang Vĩnh Hưng", "address": "",
      "dob": "2013-01-01", "balance": 0, "phone": "0978282633", "email": "hs003@example.com", "createdAt": "2025-10-19"
    },
    {
      "id": "HS004", "phone": "0937830935", "balance": 0, "address": "", "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE,
      "email": "hs004@example.com", "dob": "2013-01-01", "name": "Lê Thị Kim Ngân", "parentName": "Lê Văn Tá"
    },
    {
      "id": "HS005", "phone": "0978306800", "email": "hs005@example.com", "balance": 0, "address": "", "name": "Nguyễn Cẩm Tú",
      "createdAt": "2025-10-19", "dob": "2013-01-01", "parentName": "Nguyễn Thị Ngoan", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS006", "parentName": "Nguyễn Thị Yến", "phone": "0966330350", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19",
      "address": "", "name": "Nguyễn Thị Anh Thơ", "dob": "2013-01-01", "balance": 0, "email": "hs006@example.com"
    },
    {
      "id": "HS007", "parentName": "Đào Thị Huyền", "createdAt": "2025-10-19", "balance": 0, "phone": "0988846383",
      "status": PersonStatus.ACTIVE, "email": "hs007@example.com", "dob": "2013-01-01", "address": "", "name": "Đỗ Thành Đạt"
    },
    {
      "id": "HS008", "email": "hs008@example.com", "balance": -250000, "dob": "2013-01-01", "address": "",
      "createdAt": "2025-10-19", "name": "Quách Hải Đăng", "phone": "0968378995", "parentName": "Nguyễn Thị Chang", "status": PersonStatus.INACTIVE
    },
    {
      "id": "HS009", "name": "Đức Anh", "parentName": "Phụ huynh Đức Anh", "address": "", "balance": 0, "email": "hs009@example.com",
      "dob": "2013-01-01", "createdAt": "2025-10-19", "phone": "0353603657", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS010", "parentName": "Lê Thị Huệ", "balance": 0, "email": "hs010@example.com", "name": "Đào Thị Thùy Vân",
      "status": PersonStatus.INACTIVE, "dob": "2013-01-01", "phone": "0962221038", "createdAt": "2025-10-19", "address": ""
    },
    {
      "id": "HS011", "phone": "0398945679", "status": PersonStatus.ACTIVE, "parentName": "Nguyễn Thị Hường", "balance": 0,
      "email": "hs011@example.com", "createdAt": "2025-10-19", "dob": "2013-01-01", "address": "", "name": "Hoàng Gia Khánh"
    },
    {
      "id": "HS012", "phone": "0975793681", "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE, "dob": "2013-01-01",
      "balance": 0, "name": "Đào Thị Ngân Hà", "address": "", "email": "hs012@example.com", "parentName": "Nguyễn Thị Tuyết"
    },
    {
      "id": "HS013", "createdAt": "2025-10-19", "email": "hs013@example.com", "phone": "0971875193",
      "parentName": "Đỗ Thị Hòa", "status": PersonStatus.ACTIVE, "address": "", "name": "Hoàng Văn Phúc", "dob": "2013-01-01", "balance": -200000
    },
    {
      "id": "HS014", "balance": 0, "phone": "0966381191", "name": "Quách Thiện Triệu", "status": PersonStatus.ACTIVE,
      "createdAt": "2025-10-19", "email": "hs014@example.com", "parentName": "Đào Thùy Linh", "address": "", "dob": "2013-01-01"
    },
    {
      "id": "HS015", "name": "Quách Thị Phương Anh", "balance": 0, "parentName": "Đào Thị Ngoan", "createdAt": "2025-10-19",
      "email": "hs015@example.com", "status": PersonStatus.ACTIVE, "phone": "0379366500", "address": "", "dob": "2013-01-01"
    },
    {
      "id": "HS017", "phone": "0999909164", "status": PersonStatus.INACTIVE, "email": "hs017@example.com", "address": "",
      "balance": -800000, "parentName": "Phụ huynh Anh Quân", "dob": "2013-01-01", "name": "Anh Quân", "createdAt": "2025-10-19"
    },
    {
      "id": "HS018", "createdAt": "2025-10-19", "phone": "0781382675", "dob": "2013-01-01", "name": "Hương Giang",
      "balance": 0, "parentName": "Phụ huynh Hương Giang", "status": PersonStatus.ACTIVE, "email": "hs018@example.com", "address": ""
    },
    {
      "id": "HS019", "address": "", "phone": "0974472784", "parentName": "Nguyễn Thị Trà", "status": PersonStatus.ACTIVE,
      "balance": 0, "dob": "2013-01-01", "createdAt": "2025-10-19", "name": "Đào Thị Diệu Linh", "email": "hs019@example.com"
    },
    {
      "id": "HS020", "name": "Đào Quang Khải", "createdAt": "2025-10-19", "balance": -1400000, "email": "hs020@example.com",
      "parentName": "Đào Thị Hoa", "dob": "2013-01-01", "address": "", "phone": "0988560026", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS021", "email": "hs021@example.com", "phone": "0974722337", "dob": "2013-01-01", "address": "", "balance": 0,
      "name": "Nguyễn Thị Uyên Trang", "parentName": "Đào Thị Xoan", "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS022", "status": PersonStatus.ACTIVE, "email": "hs022@example.com", "createdAt": "2025-10-19", "name": "Hoàng Văn Hiên",
      "parentName": "Nguyễn Thị Thuyết", "phone": "0969623384", "dob": "2013-01-01", "balance": -400000, "address": ""
    },
    {
      "id": "HS023", "phone": "0979499940", "status": PersonStatus.INACTIVE, "createdAt": "2025-10-19", "email": "hs023@example.com",
      "balance": -250000, "dob": "2013-01-01", "address": "", "name": "Đào Thị Minh Châu", "parentName": "Đào Thị Minh"
    },
    {
      "id": "HS024", "parentName": "Trịnh Thị Dung", "createdAt": "2025-10-19", "dob": "2013-01-01", "name": "Quách Huy Đăng",
      "address": "", "status": PersonStatus.ACTIVE, "phone": "0975995651", "balance": 0, "email": "hs024@example.com"
    },
    {
      "id": "HS025", "phone": "0972747691", "name": "Quách Văn Thành Văn", "createdAt": "2025-10-19", "email": "hs025@example.com",
      "parentName": "Nguyễn Thị Ánh", "dob": "2013-01-01", "address": "", "status": PersonStatus.ACTIVE, "balance": -400000
    },
    {
      "id": "HS026", "name": "Hoàng Ngọc Khánh", "dob": "2013-01-01", "balance": 0, "createdAt": "2025-10-19",
      "parentName": "Đào Thị Thu", "email": "hs026@example.com", "phone": "0976384405", "status": PersonStatus.ACTIVE, "address": ""
    },
    {
      "id": "HS027", "parentName": "Đào Thị Huyền", "email": "hs027@example.com", "balance": -850000, "createdAt": "2025-10-19",
      "name": "Đào Thị Lệ Chi", "status": PersonStatus.ACTIVE, "dob": "2013-01-01", "address": "", "phone": "0979339830"
    },
    {
      "id": "HS028", "status": PersonStatus.ACTIVE, "dob": "2013-01-01", "email": "hs028@example.com", "address": "", "balance": -850000,
      "parentName": "Lê Thị Tiếu", "createdAt": "2025-10-19", "name": "Đào Bá Duy Khoa", "phone": "0398204360"
    },
    {
      "id": "HS029", "dob": "2013-01-01", "status": PersonStatus.ACTIVE, "address": "", "balance": 0, "name": "Hoàng Ruby Bảo An",
      "createdAt": "2025-10-19", "parentName": "Đào Thị Hằng Nga", "phone": "0969813161", "email": "hs029@example.com"
    },
    {
      "id": "HS030", "email": "hs030@example.com", "parentName": "Nguyễn Thị Thùy Dung", "status": PersonStatus.ACTIVE,
      "createdAt": "2025-10-19", "address": "", "name": "Đào Quang Hiên", "dob": "2013-01-01", "phone": "0983821920", "balance": -1350000
    },
    {
      "id": "HS031", "email": "hs031@example.com", "status": PersonStatus.ACTIVE, "address": "", "dob": "2013-01-01",
      "name": "Quách Thị Tú Trúc", "createdAt": "2025-10-19", "phone": "0983003625", "balance": 0, "parentName": "Đỗ Thị Nhàn"
    },
    {
      "id": "HS032", "parentName": "Nguyễn Thị Nhài", "phone": "0965896285", "dob": "2013-01-01", "balance": 0,
      "name": "Nguyễn Tùng Anh", "email": "hs032@example.com", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19", "address": ""
    },
    {
      "id": "HS033", "status": PersonStatus.ACTIVE, "balance": 0, "email": "hs033@example.com", "address": "", "name": "Nguyễn Minh Nhật",
      "parentName": "Nguyễn Thị Cúc", "dob": "2013-01-01", "createdAt": "2025-10-19", "phone": "0972658243"
    },
    {
      "id": "HS034", "email": "hs034@example.com", "parentName": "Nguyễn Thị Ngoan", "createdAt": "2025-10-19",
      "dob": "2013-01-01", "status": PersonStatus.ACTIVE, "address": "", "phone": "0982627845", "name": "Nguyễn Quốc Huy", "balance": 0
    },
    {
      "id": "HS035", "balance": 0, "email": "hs035@example.com", "parentName": "Đào Thị Chúc", "name": "Đào Thị Thùy Trâm",
      "dob": "2013-01-01", "phone": "0356145637", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19", "address": ""
    },
    {
      "id": "HS036", "parentName": "Nguyễn Thị Dung", "name": "Nguyễn Thuỷ Tiên", "dob": "2013-01-01", "address": "",
      "balance": 0, "createdAt": "2025-10-19", "email": "hs036@example.com", "status": PersonStatus.ACTIVE, "phone": "0378409869"
    },
    {
      "id": "HS037", "dob": "2013-01-01", "address": "", "createdAt": "2025-10-19", "parentName": "Hoàng Thị Nhung",
      "balance": 0, "phone": "0393579533", "status": PersonStatus.ACTIVE, "name": "Nguyễn Hoàng Phương Anh", "email": "hs037@example.com"
    },
    {
      "id": "HS038", "name": "Hoàng Thị Huyền Thu", "status": PersonStatus.ACTIVE, "balance": -250000, "email": "hs038@example.com",
      "parentName": "Nguyễn Thị Huyền Trang", "createdAt": "2025-10-19", "address": "", "dob": "2013-01-01", "phone": "0388552155"
    },
    {
      "id": "HS039", "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE, "balance": 0, "dob": "2013-01-01",
      "parentName": "Nguyễn Minh Huệ", "name": "Nguyễn Ngọc Châu", "phone": "0968665453", "email": "hs039@example.com", "address": ""
    },
    {
      "id": "HS040", "phone": "0978929234", "balance": -700000, "dob": "2012-01-01", "createdAt": "2025-10-19",
      "parentName": "Nguyễn Thị Cúc", "email": "hs040@example.com", "address": "", "name": "Nguyễn Thị Mai Anh", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS041", "status": PersonStatus.ACTIVE, "phone": "0969062371", "address": "", "name": "Nguyễn Thị Yến Linh",
      "dob": "2012-01-01", "balance": -400000, "email": "hs041@example.com", "parentName": "Nguyễn Thị Ngoan", "createdAt": "2025-10-19"
    },
    {
      "id": "HS042", "name": "Đào Thị Hà Vi", "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE, "phone": "0977931515",
      "address": "", "dob": "2012-01-01", "parentName": "Đỗ Thị Hoa", "balance": 0, "email": "hs042@example.com"
    },
    {
      "id": "HS043", "parentName": "Nguyễn Thị Mai", "name": "Đặng Xuân Bảo Lâm", "status": PersonStatus.ACTIVE, "dob": "2012-01-01",
      "balance": -750000, "address": "", "phone": "0989538405", "createdAt": "2025-10-19", "email": "hs043@example.com"
    },
    {
      "id": "HS044", "dob": "2012-01-01", "balance": -2100000, "address": "", "createdAt": "2025-10-19", "phone": "0967278808",
      "status": PersonStatus.ACTIVE, "email": "hs044@example.com", "name": "Đào Xuân An Bình", "parentName": "Hoàng Thị Thêu"
    },
    {
      "id": "HS045", "dob": "2012-01-01", "parentName": "Đỗ Thị Ánh Tuyết", "name": "Hoàng Tùng Dương", "balance": 0,
      "address": "", "createdAt": "2025-10-19", "phone": "0972728284", "status": PersonStatus.ACTIVE, "email": "hs045@example.com"
    },
    {
      "id": "HS046", "status": PersonStatus.ACTIVE, "parentName": "Lê Thị Thơm", "name": "Đào Quang Tĩnh", "phone": "0988271408",
      "balance": -1700000, "address": "", "email": "hs046@example.com", "createdAt": "2025-10-19", "dob": "2012-01-01"
    },
    {
      "id": "HS047", "name": "Quách Thiên Trường", "parentName": "Hoàng Thị Hạnh", "balance": 0, "status": PersonStatus.ACTIVE,
      "address": "", "phone": "0389417176", "email": "hs047@example.com", "dob": "2012-01-01", "createdAt": "2025-10-19"
    },
    {
      "id": "HS048", "phone": "0988976633", "balance": 0, "status": PersonStatus.ACTIVE, "email": "hs048@example.com",
      "name": "Hoàng Trung Kiên", "dob": "2012-01-01", "address": "", "createdAt": "2025-10-19", "parentName": "Hoàng Thị Tuyết"
    },
    {
      "id": "HS049", "status": PersonStatus.ACTIVE, "name": "Quách Thiên Tân", "email": "hs049@example.com", "address": "",
      "parentName": "Đào Thị Ngân", "balance": 0, "phone": "0368866672", "dob": "2012-01-01", "createdAt": "2025-10-19"
    },
    {
      "id": "HS050", "parentName": "Tạ Thị Hiền", "name": "Đào Bá Anh Tấn", "address": "", "createdAt": "2025-10-19",
      "balance": 0, "status": PersonStatus.ACTIVE, "phone": "0987894698", "dob": "2012-01-01", "email": "hs050@example.com"
    },
    {
      "id": "HS051", "dob": "2012-01-01", "address": "", "status": PersonStatus.ACTIVE, "phone": "0976050766", "email": "hs051@example.com",
      "parentName": "Trần Thị Thị", "createdAt": "2025-10-19", "balance": -400000, "name": "Đào Bảo Nguyên"
    },
    {
      "id": "HS052", "createdAt": "2025-10-19", "phone": "0387379622", "address": "", "balance": -400000,
      "parentName": "Đào Thị Hà", "status": PersonStatus.ACTIVE, "email": "hs052@example.com", "name": "Đỗ Thị Gia Ngọc", "dob": "2012-01-01"
    },
    {
      "id": "HS053", "balance": -800000, "phone": "0989634517", "dob": "2012-01-01", "parentName": "Hoàng Thị Thu",
      "createdAt": "2025-10-19", "name": "Đào Quang Anh Duy", "status": PersonStatus.ACTIVE, "address": "", "email": "hs053@example.com"
    },
    {
      "id": "HS054", "status": PersonStatus.ACTIVE, "balance": -300000, "address": "", "createdAt": "2025-10-19", "dob": "2012-01-01",
      "name": "Đào Bá Bảo Nam", "phone": "0395582859", "parentName": "Lê Thị Yến", "email": "hs054@example.com"
    },
    {
      "id": "HS055", "balance": 0, "dob": "2012-01-01", "status": PersonStatus.ACTIVE, "email": "hs055@example.com",
      "name": "Nguyễn Huy Dương", "parentName": "Nguyễn Thị Mai Hiên", "createdAt": "2025-10-19", "address": "", "phone": "0986666814"
    },
    {
      "id": "HS056", "phone": "0969546848", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19", "email": "hs056@example.com",
      "dob": "2012-01-01", "name": "Đào Anh Phúc", "parentName": "Nguyễn Thị Huế", "balance": 0, "address": ""
    },
    {
      "id": "HS057", "parentName": "Nguyễn Thị Xuân", "dob": "2012-01-01", "phone": "0969436296", "email": "hs057@example.com",
      "status": PersonStatus.ACTIVE, "address": "", "name": "Nguyễn Tiến Vinh", "createdAt": "2025-10-19", "balance": 0
    },
    {
      "id": "HS058", "dob": "2012-01-01", "parentName": "Đào Thị Hằng", "balance": 0, "email": "hs058@example.com",
      "status": PersonStatus.ACTIVE, "phone": "0393456700", "address": "", "name": "Hoàng Văn Hải Anh", "createdAt": "2025-10-19"
    },
    {
      "id": "HS059", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19", "address": "", "phone": "0372290025", "dob": "2012-01-01",
      "parentName": "Quách Thị Hoa", "email": "hs059@example.com", "name": "Nguyễn Thị Ánh", "balance": -400000
    },
    {
      "id": "HS060", "balance": 0, "address": "", "parentName": "Lê Thị Quyến", "dob": "2012-01-01", "name": "Nguyễn Thu Trang",
      "phone": "0339289990", "createdAt": "2025-10-19", "email": "hs060@example.com", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS061", "address": "", "balance": 0, "email": "hs061@example.com", "phone": "0984525905", "name": "Phạm Anh Thư",
      "createdAt": "2025-10-19", "dob": "2012-01-01", "status": PersonStatus.ACTIVE, "parentName": "Đào Thị Chinh"
    },
    {
      "id": "HS062", "createdAt": "2025-10-19", "address": "", "status": PersonStatus.ACTIVE, "parentName": "Lê Thu Hiền",
      "email": "hs062@example.com", "name": "Lê Ngọc Nhã Uyên", "balance": 0, "dob": "2012-01-01", "phone": "0983547510"
    },
    {
      "id": "HS063", "phone": "0973763593", "dob": "2012-01-01", "address": "", "name": "Đào Bá Duy Khánh",
      "email": "hs063@example.com", "createdAt": "2025-10-19", "balance": 0, "status": PersonStatus.ACTIVE, "parentName": "Lê Thị Dung"
    },
    {
      "id": "HS064", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19", "address": "", "dob": "2012-01-01", "balance": -850000,
      "email": "hs064@example.com", "phone": "0387543205", "parentName": "Nguyễn Thị Loan", "name": "Nguyễn Thị Kim Thư"
    },
    {
      "id": "HS065", "createdAt": "2025-10-19", "address": "", "status": PersonStatus.ACTIVE, "balance": -400000, "email": "hs065@example.com",
      "name": "Đào Thị Mai Anh", "parentName": "Đào Thị Huệ", "dob": "2012-01-01", "phone": "0985954528"
    },
    {
      "id": "HS066", "balance": -400000, "phone": "0974410333", "email": "hs066@example.com", "address": "",
      "createdAt": "2025-10-19", "dob": "2012-01-01", "status": PersonStatus.ACTIVE, "parentName": "Nguyễn Thị Xuân", "name": "Đào Diễm Quỳnh"
    },
    {
      "id": "HS067", "createdAt": "2025-10-19", "name": "Quách Thị Thùy Linh", "balance": 0, "phone": "0988527711",
      "parentName": "Hoàng Thị Hà", "email": "hs067@example.com", "dob": "2012-01-01", "address": "", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS068", "phone": "0971233688", "status": PersonStatus.ACTIVE, "address": "", "name": "Nguyễn Ngọc Đại",
      "email": "hs068@example.com", "parentName": "Đào Thị Huế", "createdAt": "2025-10-19", "dob": "2012-01-01", "balance": 0
    },
    {
      "id": "HS069", "name": "Đào Quang Gia Bảo", "email": "hs069@example.com", "parentName": "Hoàng Thị Huế",
      "dob": "2012-01-01", "address": "", "balance": -400000, "phone": "0373494058", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19"
    },
    {
      "id": "HS070", "address": "", "status": PersonStatus.ACTIVE, "phone": "0798507892", "name": "Nguyễn Đào Khánh Vy",
      "dob": "2012-01-01", "parentName": "Đào Thị My", "balance": 0, "email": "hs070@example.com", "createdAt": "2025-10-19"
    },
    {
      "id": "HS071", "parentName": "Quách Thị Hằng", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19", "email": "hs071@example.com",
      "address": "", "dob": "2012-01-01", "balance": 0, "phone": "0984421293", "name": "Đào Thị Ánh Tuyết"
    },
    {
      "id": "HS072", "createdAt": "2025-10-19", "phone": "0969608668", "name": "Đào Thị Quỳnh Anh", "email": "hs072@example.com",
      "address": "", "status": PersonStatus.ACTIVE, "balance": 0, "dob": "2012-01-01", "parentName": "Đào Thị Nhàn"
    },
    {
      "id": "HS073", "status": PersonStatus.ACTIVE, "name": "Đỗ Thị Hồng", "dob": "2012-01-01", "balance": 0, "email": "hs073@example.com",
      "createdAt": "2025-10-19", "phone": "0976260186", "parentName": "Nguyễn Thị Huyền", "address": ""
    },
    {
      "id": "HS074", "dob": "2012-01-01", "balance": -400000, "email": "hs074@example.com", "address": "",
      "parentName": "Đào Thị Ngân", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19", "phone": "0385721482", "name": "Hoàng Gia Huy"
    },
    {
      "id": "HS075", "phone": "0332975911", "createdAt": "2025-10-19", "email": "hs075@example.com", "address": "",
      "status": PersonStatus.ACTIVE, "name": "Đào Quang Hiếu", "dob": "2012-01-01", "parentName": "Trương Thị Thảo", "balance": 0
    },
    {
      "id": "HS076", "parentName": "Đào Quang Hợp", "name": "Đào Thị Hà Vi", "status": PersonStatus.ACTIVE, "phone": "0948808779",
      "createdAt": "2025-10-19", "email": "hs076@example.com", "balance": -2783000, "address": "", "dob": "2012-01-01"
    },
    {
      "id": "HS077", "dob": "2011-01-01", "parentName": "Đào Thị Bích Vân", "phone": "0972826976", "address": "",
      "email": "hs077@example.com", "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE, "balance": -350000, "name": "Thái Nguyên Vũ"
    },
    {
      "id": "HS078", "createdAt": "2025-10-19", "address": "", "name": "Đào Bá Long Anh", "balance": 0, "dob": "2011-01-01",
      "email": "hs078@example.com", "status": PersonStatus.ACTIVE, "phone": "0977921515", "parentName": "Đỗ Thị Hoa"
    },
    {
      "id": "HS079", "name": "Nguyễn Thị Yến Nhi", "createdAt": "2025-10-19", "phone": "0974722337",
      "parentName": "Đào Thị Xoan", "status": PersonStatus.ACTIVE, "balance": 0, "dob": "2011-01-01", "email": "hs079@example.com", "address": ""
    },
    {
      "id": "HS080", "phone": "0982263390", "parentName": "Đào Thị Tơ", "address": "", "dob": "2011-01-01", "status": PersonStatus.ACTIVE,
      "email": "hs080@example.com", "name": "Quách Thị Bảo Xuyến", "balance": -4664000, "createdAt": "2025-10-19"
    },
    {
      "id": "HS081", "email": "hs081@example.com", "phone": "0352850418", "address": "", "status": PersonStatus.ACTIVE,
      "name": "Nguyễn Kỳ Phong", "createdAt": "2025-10-19", "dob": "2011-01-01", "balance": -600000, "parentName": "Đào Thị Huyên"
    },
    {
      "id": "HS082", "address": "", "parentName": "Trương Thị Lựu", "dob": "2011-01-01", "status": PersonStatus.ACTIVE,
      "phone": "0376027755", "balance": 0, "name": "Lê Đức Thịnh", "createdAt": "2025-10-19", "email": "hs082@example.com"
    },
    {
      "id": "HS083", "email": "hs083@example.com", "parentName": "Lê Thị Liên", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19",
      "balance": -1550000, "phone": "0384747995", "name": "Đào Quang Khánh", "address": "", "dob": "2011-01-01"
    },
    {
      "id": "HS084", "email": "hs084@example.com", "name": "Đào Thị Anh Thư", "status": PersonStatus.ACTIVE, "address": "",
      "dob": "2011-01-01", "phone": "0974076323", "balance": -2583000, "createdAt": "2025-10-19", "parentName": "Nguyễn Thị Lương"
    },
    {
      "id": "HS085", "createdAt": "2025-10-19", "parentName": "Lê Thị Diệu Linh", "address": "", "name": "Hoàng Trường Giang",
      "status": PersonStatus.ACTIVE, "phone": "0919992009", "email": "hs085@example.com", "dob": "2011-01-01", "balance": -4064000
    },
    {
      "id": "HS086", "parentName": "Đào Thị Ngoan", "createdAt": "2025-10-19", "dob": "2011-01-01", "phone": "0379366500",
      "email": "hs086@example.com", "status": PersonStatus.ACTIVE, "address": "", "balance": 0, "name": "Quách Thiện Huy"
    },
    {
      "id": "HS087", "email": "hs087@example.com", "parentName": "Đào Quang Hợp", "balance": -2633000, "phone": "0948808779",
      "name": "Đào Thị Hà", "status": PersonStatus.ACTIVE, "address": "", "createdAt": "2025-10-19", "dob": "2011-01-01"
    },
    {
      "id": "HS088", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19", "balance": -1050000, "phone": "0332934811",
      "email": "hs088@example.com", "dob": "2011-01-01", "address": "", "parentName": "Nguyễn Thị Huyền", "name": "Nguyễn Thị Anh Thư"
    },
    {
      "id": "HS089", "balance": 0, "createdAt": "2025-10-19", "address": "", "parentName": "Nguyễn Thị Mị",
      "name": "Nguyễn Thị Thùy Trang", "status": PersonStatus.ACTIVE, "phone": "0975670868", "email": "hs089@example.com", "dob": "2011-01-01"
    },
    {
      "id": "HS090", "dob": "2011-01-01", "name": "Hoàng Bảo Trâm", "phone": "0969813161", "parentName": "Đào Thị Hằng Nga",
      "email": "hs090@example.com", "createdAt": "2025-10-19", "address": "", "status": PersonStatus.ACTIVE, "balance": 0
    },
    {
      "id": "HS091", "status": PersonStatus.ACTIVE, "address": "", "parentName": "Đào Thị Thu Phương", "createdAt": "2025-10-19",
      "dob": "2011-01-01", "email": "hs091@example.com", "name": "Lê Thị Bích Ngọc", "balance": 0, "phone": "0987991114"
    },
    {
      "id": "HS092", "name": "Đỗ Thị Huyền Trang", "parentName": "Nguyễn Thị Xuyến", "address": "", "dob": "2011-01-01",
      "createdAt": "2025-10-19", "balance": -1100000, "email": "hs092@example.com", "phone": "0967777886", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS093", "name": "Nguyễn Thị Ngọc Anh", "email": "hs093@example.com", "parentName": "Nguyễn Thị Yến",
      "dob": "2011-01-01", "phone": "0966330350", "address": "", "createdAt": "2025-10-19", "balance": 0, "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS094", "balance": -350000, "address": "", "status": PersonStatus.ACTIVE, "phone": "0979499940",
      "email": "hs094@example.com", "parentName": "Đào Thị Minh", "name": "Đào Thị Vân", "dob": "2011-01-01", "createdAt": "2025-10-19"
    },
    {
      "id": "HS095", "dob": "2011-01-01", "email": "hs095@example.com", "address": "", "balance": 0,
      "parentName": "Nguyễn Thị Tuyết", "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE, "phone": "0975793681", "name": "Đào Thị Thanh Huyền"
    },
    {
      "id": "HS096", "email": "hs096@example.com", "balance": -700000, "address": "", "phone": "0336333656",
      "dob": "2011-01-01", "parentName": "Nguyễn Thị Phương", "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE, "name": "Hoàng Như Tú"
    },
    {
      "id": "HS097", "balance": 0, "address": "", "name": "Nguyễn Huy Phát", "createdAt": "2025-10-19",
      "email": "hs097@example.com", "dob": "2011-01-01", "status": PersonStatus.ACTIVE, "phone": "0936362840", "parentName": "Nguyễn Thị Ngoan"
    },
    {
      "id": "HS098", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19", "name": "Nguyễn Phương Anh", "phone": "0978306800",
      "balance": 0, "address": "", "email": "hs098@example.com", "dob": "2011-01-01", "parentName": "Nguyễn Thị Ngoan"
    },
    {
      "id": "HS099", "status": PersonStatus.ACTIVE, "email": "hs099@example.com", "name": "Lê Thị Yến", "dob": "2011-01-01",
      "address": "", "createdAt": "2025-10-19", "balance": 0, "phone": "0352037089", "parentName": "Hoàng Thị Hoài"
    },
    {
      "id": "HS100", "email": "hs100@example.com", "name": "Nguyễn Thị Thúy Hằng", "address": "", "phone": "0972742764",
      "dob": "2011-01-01", "status": PersonStatus.ACTIVE, "parentName": "Hoàng Thị Hảo", "balance": 0, "createdAt": "2025-10-19"
    },
    {
      "id": "HS101", "parentName": "Đào Thị Suyến", "balance": -1550000, "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE,
      "name": "Đào Thị Thu Hiền", "dob": "2011-01-01", "address": "", "email": "hs101@example.com", "phone": "0356771608"
    },
    {
      "id": "HS102", "balance": 0, "address": "", "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE, "email": "hs102@example.com",
      "dob": "2011-01-01", "name": "Đào Thị Như Quỳnh", "phone": "0985425165", "parentName": "Hoàng Thị Vinh"
    },
    {
      "id": "HS103", "status": PersonStatus.ACTIVE, "address": "", "balance": -2720000, "email": "hs103@example.com",
      "name": "Nguyễn Tuấn Dương", "parentName": "Đỗ Thị Liên", "createdAt": "2025-10-19", "dob": "2011-01-01", "phone": "0388807698"
    },
    {
      "id": "HS104", "address": "", "status": PersonStatus.ACTIVE, "phone": "0372624435", "email": "hs104@example.com",
      "parentName": "Đào Thị Xuyến", "dob": "2011-01-01", "name": "Hoàng Thị Thu", "createdAt": "2025-10-19", "balance": 0
    },
    {
      "id": "HS105", "phone": "0985532563", "balance": 0, "address": "", "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE,
      "email": "hs105@example.com", "dob": "2011-01-01", "name": "Hoàng Hà Thư", "parentName": "Nguyễn Thị Thúy Hằng"
    },
    {
      "id": "HS106", "dob": "2011-01-01", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19", "parentName": "Quách Thị Hằng",
      "balance": 0, "name": "Đào Quang Sáng", "phone": "0984421293", "email": "hs106@example.com", "address": ""
    },
    {
      "id": "HS107", "address": "", "balance": 0, "createdAt": "2025-10-19", "email": "hs107@example.com",
      "phone": "0961955112", "status": PersonStatus.ACTIVE, "name": "Nguyễn Thị Thu Trang", "dob": "2011-01-01", "parentName": "Đào Thị Lệ"
    },
    {
      "id": "HS108", "status": PersonStatus.ACTIVE, "name": "Trương Thảo My", "phone": "0394645895", "address": "", "balance": -600000,
      "createdAt": "2025-10-19", "dob": "2011-01-01", "email": "hs108@example.com", "parentName": "Đào Thị Hạnh"
    },
    {
      "id": "HS109", "name": "Lê Thị Khánh Thi", "status": PersonStatus.ACTIVE, "email": "hs109@example.com", "phone": "0928996969",
      "parentName": "Hoàng Thị Lan", "createdAt": "2025-10-19", "address": "", "dob": "2011-01-01", "balance": 0
    },
    {
      "id": "HS110", "parentName": "Đào Thị Huyền", "email": "hs110@example.com", "name": "Đào Bá Huy Anh", "address": "",
      "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE, "balance": -550000, "dob": "2011-01-01", "phone": "0979339830"
    },
    {
      "id": "HS111", "parentName": "Đào Thị Nghĩa", "status": PersonStatus.ACTIVE, "balance": -9223000, "dob": "2011-01-01",
      "createdAt": "2025-10-19", "phone": "0979879278", "name": "Quách Thiện Trường", "email": "hs111@example.com", "address": ""
    },
    {
      "id": "HS112", "createdAt": "2025-10-19", "name": "Nguyễn Thị An Bình", "dob": "2011-01-01", "parentName": "Quách Thị Hà",
      "status": PersonStatus.ACTIVE, "email": "hs112@example.com", "balance": 0, "address": "", "phone": "0961084094"
    },
    {
      "id": "HS113", "name": "Nguyễn Hồng Hải", "address": "", "phone": "0862333699", "parentName": "Nguyễn Hồng Khải",
      "balance": -550000, "email": "hs113@example.com", "dob": "2011-01-01", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19"
    },
    {
      "id": "HS114", "address": "", "status": PersonStatus.ACTIVE, "phone": "0395201479", "email": "hs114@example.com",
      "parentName": "Nguyễn Văn Ngũ", "dob": "2011-01-01", "name": "Nguyễn Đức Anh", "createdAt": "2025-10-19", "balance": 0
    },
    {
      "id": "HS115", "status": PersonStatus.ACTIVE, "name": "Trương Thị Bích Phượng", "dob": "2011-01-01", "balance": 0,
      "email": "hs115@example.com", "address": "", "createdAt": "2025-10-19", "phone": "0986105220", "parentName": "Đặng Thị Tình"
    },
    {
      "id": "HS116", "name": "Nguyễn Thị Thùy Dung", "status": PersonStatus.ACTIVE, "phone": "0869146844", "dob": "2011-01-01",
      "parentName": "Hoàng Thị Oanh", "createdAt": "2025-10-19", "email": "hs116@example.com", "balance": -600000, "address": ""
    },
    {
      "id": "HS117", "status": PersonStatus.ACTIVE, "address": "", "email": "hs117@example.com", "parentName": "Nguyễn Thị Hiệp",
      "phone": "0397773131", "name": "Dư Hải Vân", "dob": "2011-01-01", "balance": 0, "createdAt": "2025-10-19"
    },
    {
      "id": "HS118", "email": "hs118@example.com", "dob": "2011-01-01", "balance": 0, "status": PersonStatus.ACTIVE,
      "parentName": "Đào Thị Tuyết", "name": "Đào Thanh Hải", "createdAt": "2025-10-19", "address": "", "phone": "0964997080"
    },
    {
      "id": "HS119", "email": "hs119@example.com", "createdAt": "2025-10-19", "parentName": "Lê Thu Hiền",
      "name": "Lê Thị Hương Giang", "status": PersonStatus.ACTIVE, "address": "", "dob": "2011-01-01", "balance": 0, "phone": "0983547510"
    },
    {
      "id": "HS120", "name": "Đỗ Thị Phương Anh", "status": PersonStatus.ACTIVE, "parentName": "Đào Thị Nga", "createdAt": "2025-10-19",
      "email": "hs120@example.com", "balance": 0, "address": "", "dob": "2011-01-01", "phone": "0354625924"
    },
    {
      "id": "HS121", "createdAt": "2025-10-19", "parentName": "Lê Thúy Hợp", "balance": 0, "email": "hs121@example.com",
      "name": "Nguyễn Thúy Hiền", "address": "", "dob": "2011-01-01", "status": PersonStatus.ACTIVE, "phone": "0988638826"
    },
    {
      "id": "HS122", "email": "hs122@example.com", "parentName": "Phụ huynh Đại", "createdAt": "2025-10-19",
      "dob": "2011-01-01", "balance": 0, "address": "", "phone": "0722305433", "name": "Đại", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS123", "email": "hs123@example.com", "address": "", "dob": "2011-01-01", "createdAt": "2025-10-19",
      "phone": "0378391787", "parentName": "Đỗ Thị Nghĩa", "status": PersonStatus.ACTIVE, "name": "Đào Thị Tố Uyên", "balance": 0
    },
    {
      "id": "HS124", "createdAt": "2025-10-19", "email": "hs124@example.com", "balance": -750000, "dob": "2011-11-05",
      "address": "", "phone": "0355380311", "name": "Đào Quang Quyết", "parentName": "NGUYỄN THỊ PHA", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS125", "createdAt": "2025-10-19", "name": "Nguyễn Lê Thu Ngân", "dob": "2009-01-01", "balance": -300000,
      "status": PersonStatus.ACTIVE, "email": "hs125@example.com", "phone": "0869482207", "address": "", "parentName": "LÊ THỊ HUYỀN"
    },
    {
      "id": "HS126", "email": "hs126@example.com", "address": "", "balance": -300000, "phone": "0977356862",
      "createdAt": "2025-10-19", "parentName": "Nguyễn Thị Huyền", "dob": "2011-08-24", "name": "Đào Duy Anh", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS127", "status": PersonStatus.ACTIVE, "name": "Đào Thị Nhung", "createdAt": "2025-10-19", "parentName": "ĐÀO THỊ YẾN",
      "dob": "2011-03-25", "email": "hs127@example.com", "address": "", "phone": "0969476186", "balance": 0
    },
    {
      "id": "HS128", "phone": "0973723075", "status": PersonStatus.ACTIVE, "name": "Đào Thị Hoài Thu", "createdAt": "2025-10-19",
      "balance": 0, "dob": "2011-08-16", "email": "hs128@example.com", "parentName": "NGUYỄN THỊ MAI", "address": ""
    },
    {
      "id": "HS129", "parentName": "ĐỖ THỊ CHỈNH", "status": PersonStatus.ACTIVE, "dob": "2011-07-31", "email": "hs129@example.com",
      "createdAt": "2025-10-19", "name": "Đỗ Quỳnh Vy", "address": "", "balance": 0, "phone": "0989954639"
    },
    {
      "id": "HS130", "name": "Quách Thị Phương Nhi", "createdAt": "2025-10-19", "email": "hs130@example.com",
      "dob": "2011-04-21", "address": "", "balance": 0, "parentName": "ĐÀO THỊ NGÂN", "status": PersonStatus.ACTIVE, "phone": "0984421293"
    },
    {
      "id": "HS131", "phone": "0973899348", "address": "", "balance": 0, "email": "hs131@example.com", "status": PersonStatus.ACTIVE,
      "dob": "2011-09-28", "parentName": "Lê Thị Thảo", "createdAt": "2025-10-19", "name": "Đào Quang Thái"
    },
    {
      "id": "HS132", "address": "", "email": "hs132@example.com", "dob": "2011-02-20", "parentName": "NGUYỄN THỊ CHÂU",
      "balance": -300000, "phone": "0972063633", "name": "Hoàng Văn Nam", "status": PersonStatus.ACTIVE, "createdAt": "2025-10-19"
    },
    {
      "id": "HS133", "email": "hs133@example.com", "status": PersonStatus.ACTIVE, "dob": "2011-08-13", "name": "Đào Thị Thanh Dung",
      "phone": "0981714733", "balance": 0, "createdAt": "2025-10-19", "parentName": "ĐỖ THỊ BẰNG", "address": "Châu Mai"
    },
    {
      "id": "HS134", "address": "", "balance": 0, "phone": "0971692017", "status": PersonStatus.ACTIVE, "parentName": "HOÀNG THỊ HỢP",
      "email": "hs134@example.com", "name": "Nguyễn Thị Ánh Ly", "dob": "2011-08-03", "createdAt": "2025-10-19"
    },
    {
      "id": "HS135", "phone": "0968379102", "status": PersonStatus.ACTIVE, "parentName": "Đào Quang Hiếu", "createdAt": "2025-10-19",
      "address": "", "email": "hs135@example.com", "balance": -700000, "dob": "2011-11-10", "name": "Đào Quang Vĩnh"
    },
    {
      "id": "HS136", "address": "", "balance": 0, "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE, "name": "Đào Thị Hồng Nhung",
      "email": "hs136@example.com", "phone": "0988431211", "parentName": "Đỗ Thị Hà", "dob": "2011-09-09"
    },
    {
      "id": "HS137", "address": "", "dob": "2011-08-08", "status": PersonStatus.ACTIVE, "phone": "0977027742",
      "parentName": "NGUYỄN THANH HIỀN", "name": "Nguyễn Thanh Hằng", "balance": 0, "createdAt": "2025-10-19", "email": "hs137@example.com"
    },
    {
      "id": "HS138", "name": "Đào Thị Quỳnh", "createdAt": "2025-10-19", "email": "hs138@example.com", "dob": "2011-10-18",
      "balance": 0, "parentName": "ĐÀO THỊ HÒA", "address": "", "status": PersonStatus.ACTIVE, "phone": "0374127952"
    },
    {
      "id": "HS139", "address": "", "balance": -300000, "status": PersonStatus.ACTIVE, "phone": "0877028344",
      "parentName": "Phụ huynh Nguyễn Yến Nhi", "email": "hs139@example.com", "name": "Nguyễn Yến Nhi", "dob": "2009-01-01", "createdAt": "2025-10-19"
    },
    {
      "id": "HS140", "address": "", "status": PersonStatus.ACTIVE, "phone": "0365564568", "createdAt": "2025-10-19",
      "email": "hs140@example.com", "parentName": "HOÀNG THANH QUÝ", "dob": "2011-06-21", "balance": 0, "name": "Phạm Yến Nhi"
    },
    {
      "id": "HS141", "name": "Đào Việt Hà", "dob": "2011-11-22", "balance": 0, "createdAt": "2025-10-19", "phone": "0972564160",
      "parentName": "NGUYỄN THỊ TRÀ", "address": "", "status": PersonStatus.ACTIVE, "email": "hs141@example.com"
    },
    {
      "id": "HS142", "status": PersonStatus.ACTIVE, "email": "hs142@example.com", "address": "", "phone": "0969623384", "balance": -750000,
      "createdAt": "2025-10-19", "dob": "2011-03-04", "name": "Hoàng Thị Hằng", "parentName": "NGUYỄN THỊ THUYẾT"
    },
    {
      "id": "HS143", "name": "Nguyễn Thị Tường Vy", "balance": 0, "email": "hs143@example.com", "createdAt": "2025-10-19",
      "dob": "2011-02-14", "parentName": "ĐÀO THỊ YẾN", "status": PersonStatus.ACTIVE, "address": "", "phone": "0982721078"
    },
    {
      "id": "HS144", "status": PersonStatus.ACTIVE, "parentName": "ĐÀO THỊ HUYỀN", "email": "hs144@example.com", "name": "Hoàng Khánh Linh",
      "address": "", "phone": "0868878958", "createdAt": "2025-10-19", "balance": -350000, "dob": "2011-07-10"
    },
    {
      "id": "HS145", "balance": 0, "createdAt": "2025-10-19", "name": "Hoàng Gia Minh", "parentName": "ĐỖ THỊ ÁNH TUYẾT",
      "dob": "2011-02-03", "status": PersonStatus.ACTIVE, "email": "hs145@example.com", "address": "", "phone": "0972728284"
    },
    {
      "id": "HS146", "name": "Đào Quang Lâm", "email": "hs146@example.com", "parentName": "HOÀNG THỊ CHIỀU", "balance": 0,
      "phone": "0984168791", "createdAt": "2025-10-19", "status": PersonStatus.ACTIVE, "dob": "2011-06-13", "address": ""
    },
    {
      "id": "HS147", "address": "", "balance": 0, "phone": "0929519986", "status": PersonStatus.ACTIVE, "parentName": "HOÀNG THỊ THẢO",
      "email": "hs147@example.com", "name": "Đào Thị Thu Hiền", "dob": "2011-05-25", "createdAt": "2025-10-19"
    },
    {
      "id": "HS148", "email": "hs148@example.com", "createdAt": "2025-10-19", "dob": "2011-11-09", "balance": 0,
      "status": PersonStatus.ACTIVE, "address": "", "name": "Hoàng Thị Kim Hiền", "parentName": "NGUYỄN THỊ THẢO", "phone": "0356171307"
    },
    {
      "id": "HS149", "address": "Từ Châu", "status": PersonStatus.ACTIVE, "email": "hs149@example.com", "parentName": "NGUYỄN THỊ THẢO",
      "phone": "0338256501", "name": "Nguyễn Hương Giang", "dob": "2011-01-27", "balance": -350000, "createdAt": "2025-10-19"
    },
    {
      "id": "HS150", "parentName": "Hoàng Văn Sum", "address": "", "email": "hs150@example.com", "balance": 0,
      "phone": "0337797326", "status": PersonStatus.ACTIVE, "dob": "2011-10-14", "name": "Hoàng Bảo Sơn", "createdAt": "2025-10-19"
    },
    {
      "id": "HS151", "parentName": "LÊ THỊ HUYỀN", "createdAt": "2025-10-19", "balance": -1100000, "name": "Đào Xuân Thành Đạt",
      "email": "hs151@example.com", "address": "", "status": PersonStatus.ACTIVE, "dob": "2011-01-20", "phone": "0968632266"
    },
    {
      "id": "HS152", "parentName": "Đào Thị Oanh", "createdAt": "2025-10-19", "address": "", "status": PersonStatus.ACTIVE,
      "phone": "0965592009", "balance": -1677000, "name": "Hoàng Văn Lâm", "dob": "2011-10-09", "email": "hs152@example.com"
    },
    {
      "id": "HS153", "name": "Đào Quang Thắng", "balance": 0, "dob": "2011-02-15", "createdAt": "2025-10-19", "address": "",
      "phone": "0372724285", "parentName": "Hoàng Thị Hạnh", "email": "hs153@example.com", "status": PersonStatus.ACTIVE
    },
    {
      "id": "HS154", "phone": "0383838711", "name": "Đào Bá Hải", "email": "hs154@example.com", "dob": "2011-12-19",
      "status": PersonStatus.ACTIVE, "parentName": "LÊ THỊ LUYỆN", "address": "", "balance": -350000, "createdAt": "2025-10-19"
    },
    {
      "id": "HS155", "email": "hs155@example.com", "balance": -1500000, "dob": "2011-08-30", "parentName": "ĐÀO QUANG CÓ",
      "phone": "0969792281", "status": PersonStatus.ACTIVE, "address": "", "name": "Đào Thị Thủy", "createdAt": "2025-10-19"
    },
    {
      "id": "HS156", "parentName": "Nguyễn Thị Phượng", "address": "Từ Châu", "email": "hs156@example.com", "balance": 0,
      "createdAt": "2025-10-19", "dob": "2011-10-28", "status": PersonStatus.ACTIVE, "phone": "0989098733", "name": "Nguyễn Ngọc Anh"
    },
    {
      "id": "HS157", "email": "hs157@example.com", "createdAt": "2025-10-01", "parentName": "Nguyễn Thị Xiêm ",
      "name": "Đào Quang Phong", "status": PersonStatus.ACTIVE, "address": "", "dob": "2010-01-01", "balance": 0, "phone": "0966704493"
    },
    {
      "id": "HS158", "balance": 0, "dob": "2010-01-01", "status": PersonStatus.ACTIVE, "phone": "0969773118", "address": "",
      "name": "Đảo Quang Minh Tuấn", "email": "hs158@example.com", "parentName": "Hoàng Thị Hái", "createdAt": "2025-10-10"
    },
    {
      "id": "HS160", "address": "", "createdAt": "2025-10-30", "balance": 0, "email": "hs100@email.com", "dob": "2014-09-15",
      "phone": "0349496356", "name": "Đào Quang Uy Long", "status": PersonStatus.ACTIVE, "parentName": ""
    }
  ];

export const MOCK_TEACHERS: Teacher[] = [
    {
      "id": "DAT", "name": "Lê Văn Đạt", "status": PersonStatus.ACTIVE, "subject": "Toán", "qualification": "Cử nhân Sư phạm",
      "salaryType": SalaryType.MONTHLY, "rate": 0, "createdAt": "2025-10-19", "dob": "1989-02-28", "email": "dat.lv@example.com",
      "address": "", "password": "28021989", "role": UserRole.TEACHER, "phone": "0822448444"
    },
    {
      "id": "QUYEN", "subject": "Đa năng", "email": "", "address": "", "rate": 0, "name": "Đào Thị Quyến", "qualification": "",
      "role": UserRole.TEACHER, "createdAt": "", "phone": "", "salaryType": SalaryType.MONTHLY, "dob": "1989-12-01", "status": PersonStatus.ACTIVE
    }
  ];

export const MOCK_STAFF: Staff[] = [
    {
      "id": "NV01", "email": "", "status": PersonStatus.ACTIVE, "dob": "1989-02-28", "role": UserRole.MANAGER, "address": "", "phone": "",
      "name": "Lê Văn Đạt", "position": "Nhân viên", "createdAt": ""
    }
  ];

export const MOCK_CLASSES: Class[] = [
    {
      "id": "L01", "fee": { "type": FeeType.PER_SESSION, "amount": 50000 }, "name": "Toán 6 cơ bản",
      "schedule": [{"endTime": "16:45", "dayOfWeek": "Thursday", "startTime": "15:00"}, {"dayOfWeek": "Sunday", "startTime": "15:00", "endTime": "16:45"}],
      "teacherIds": ["DAT", "QUYEN"],
      "studentIds": ["HS001", "HS002", "HS003", "HS004", "HS005", "HS006", "HS007", "HS008", "HS009", "HS010", "HS011", "HS012", "HS013", "HS014", "HS015", "HS017", "HS160"], "subject": "Toán"
    },
    {
      "id": "L02", "fee": { "type": FeeType.PER_SESSION, "amount": 50000 }, "teacherIds": ["DAT", "QUYEN"],
      "studentIds": ["HS018", "HS019", "HS020", "HS021", "HS022", "HS023", "HS024", "HS025", "HS026", "HS027", "HS028", "HS029", "HS030", "HS031", "HS032", "HS033", "HS034", "HS035", "HS036", "HS037", "HS038", "HS039"],
      "subject": "Toán", "name": "Toán 6 mục tiêu 8+", "schedule": [{"dayOfWeek": "Tuesday", "startTime": "15:00", "endTime": "16:45"}, {"dayOfWeek": "Friday", "endTime": "16:45", "startTime": "15:00"}]
    },
    {
      "id": "L03",
      "studentIds": ["HS040", "HS041", "HS042", "HS043", "HS044", "HS045", "HS046", "HS047", "HS048", "HS049", "HS050", "HS051", "HS052", "HS053", "HS054", "HS055", "HS056", "HS057", "HS058"],
      "teacherIds": ["DAT", "QUYEN"], "subject": "Toán", "fee": { "type": FeeType.PER_SESSION, "amount": 50000 },
      "schedule": [{"endTime": "18:45", "startTime": "17:00", "dayOfWeek": "Thursday"}, {"startTime": "17:00", "endTime": "18:45", "dayOfWeek": "Sunday"}], "name": "Toán 7 cơ bản"
    },
    {
      "id": "L04", "subject": "Toán", "name": "Toán 7 mục tiêu 8+", "teacherIds": ["DAT", "QUYEN"],
      "schedule": [{"startTime": "17:00", "endTime": "18:45", "dayOfWeek": "Tuesday"}, {"endTime": "18:45", "dayOfWeek": "Friday", "startTime": "17:00"}],
      "studentIds": ["HS059", "HS060", "HS061", "HS062", "HS063", "HS064", "HS065", "HS066", "HS067", "HS068", "HS069", "HS070", "HS071", "HS072", "HS073", "HS074", "HS075", "HS076", "HS157", "HS158"],
      "fee": { "amount": 50000, "type": FeeType.PER_SESSION }
    },
    {
      "id": "L05",
      "studentIds": ["HS077", "HS078", "HS079", "HS080", "HS081", "HS082", "HS083", "HS084", "HS085", "HS086", "HS087", "HS088", "HS089", "HS090", "HS091", "HS092", "HS093", "HS094", "HS095", "HS096", "HS097", "HS098", "HS099", "HS100", "HS101", "HS102", "HS103"],
      "name": "Toán 8 cơ bản", "schedule": [{"endTime": "18:45", "dayOfWeek": "Monday", "startTime": "17:00"}, {"dayOfWeek": "Wednesday", "startTime": "17:00", "endTime": "18:45"}],
      "teacherIds": ["DAT", "QUYEN"], "fee": { "amount": 50000, "type": FeeType.PER_SESSION }, "subject": "Toán"
    },
    {
      "id": "L06", "teacherIds": ["DAT", "QUYEN"], "name": "Toán 8 mục tiêu 8+", "subject": "Toán",
      "studentIds": ["HS104", "HS105", "HS106", "HS107", "HS108", "HS109", "HS110", "HS111", "HS112", "HS113", "HS114", "HS115", "HS116", "HS117", "HS118", "HS119", "HS120", "HS121", "HS122", "HS123"],
      "fee": { "type": FeeType.PER_SESSION, "amount": 50000 }, "schedule": [{"dayOfWeek": "Monday", "endTime": "16:45", "startTime": "15:00"}, {"dayOfWeek": "Wednesday", "endTime": "16:45", "startTime": "15:00"}]
    },
    {
      "id": "L07", "fee": { "amount": 50000, "type": FeeType.PER_SESSION }, "name": "Toán 9 mới",
      "schedule": [{"startTime": "19:00", "dayOfWeek": "Tuesday", "endTime": "20:45"}, {"startTime": "19:00", "endTime": "20:45", "dayOfWeek": "Friday"}],
      "teacherIds": ["DAT", "QUYEN"], "subject": "Toán",
      "studentIds": ["HS124", "HS125", "HS126", "HS127", "HS128", "HS129", "HS130", "HS131", "HS132", "HS133", "HS134", "HS135", "HS136", "HS137", "HS138", "HS139"]
    },
    {
      "id": "L08",
      "studentIds": ["HS140", "HS141", "HS142", "HS143", "HS144", "HS145", "HS146", "HS147", "HS148", "HS149", "HS150", "HS151", "HS152", "HS153", "HS154", "HS155", "HS156"],
      "subject": "Toán", "teacherIds": ["DAT", "QUYEN"], "name": "Toán 9 mục tiêu 8+",
      "schedule": [{"startTime": "19:00", "endTime": "20:45", "dayOfWeek": "Thursday"}, {"endTime": "20:45", "dayOfWeek": "Sunday", "startTime": "19:00"}],
      "fee": { "amount": 50000, "type": FeeType.PER_SESSION }
    }
  ];

export const MOCK_ATTENDANCE: AttendanceRecord[] = (Object.values(
    [{"id":"A-1761379570687-HS063","studentId":"HS063","status":"PRESENT","date":"2025-10-25","classId":"L04"},
    {"id":"A-1761379570688-HS065","status":"PRESENT","studentId":"HS065","classId":"L04","date":"2025-10-25"},
    {"id":"A-1761379570688-HS066","status":"PRESENT","date":"2025-10-25","classId":"L04","studentId":"HS066"},
    {"id":"A-1761379570688-HS069","date":"2025-10-25","classId":"L04","studentId":"HS069","status":"PRESENT"},
    {"id":"A-1761379570688-HS071","classId":"L04","date":"2025-10-25","status":"PRESENT","studentId":"HS071"},
    {"id":"A-1761379570688-HS075","classId":"L04","date":"2025-10-25","status":"PRESENT","studentId":"HS075"},
    {"id":"A-1761379570688-HS076","status":"PRESENT","date":"2025-10-25","studentId":"HS076","classId":"L04"},
    {"id":"A-1761379570688-HS157","studentId":"HS157","date":"2025-10-25","status":"PRESENT","classId":"L04"},
    {"id":"A-1761379570688-HS158","status":"PRESENT","classId":"L04","date":"2025-10-25","studentId":"HS158"},
    {"id":"A-1761379570689-HS059","status":"PRESENT","studentId":"HS059","classId":"L04","date":"2025-10-25"},
    {"id":"A-1761379570689-HS060","date":"2025-10-25","classId":"L04","status":"PRESENT","studentId":"HS060"},
    {"id":"A-1761379570689-HS061","date":"2025-10-25","studentId":"HS061","classId":"L04","status":"LATE"},
    {"id":"A-1761379570689-HS062","classId":"L04","studentId":"HS062","status":"PRESENT","date":"2025-10-25"},
    {"id":"A-1761379570689-HS064","date":"2025-10-25","classId":"L04","status":"PRESENT","studentId":"HS064"},
    {"id":"A-1761379570689-HS067","status":"PRESENT","studentId":"HS067","classId":"L04","date":"2025-10-25"}]
    .map(r => ({...r, status: r.status as AttendanceStatus}))
    .reduce((acc, curr) => ({...acc, [curr.id]: curr }), {})
) as AttendanceRecord[]);


export const MOCK_INVOICES: Invoice[] = [];
export const MOCK_PROGRESS_REPORTS: ProgressReport[] = [];
export const MOCK_TRANSACTIONS: Transaction[] = [
    { "id": "89wcOSPagIQ1mCEd3h1f", "type": TransactionType.PAYMENT, "description": "Thanh toán học phí trực tiếp", "date": "2025-10-26", "studentId": "HS099", "amount": 350000 },
    { "id": "9zBxGjH9TtxYZW6i1qf7", "description": "đóng học", "date": "2025-10-24", "studentId": "HS102", "type": TransactionType.ADJUSTMENT_CREDIT, "amount": 350000 },
    { "id": "BvC3Xm7fWIb29pBzhAh8", "amount": 400000, "description": "đóng học", "date": "2025-10-24", "type": TransactionType.ADJUSTMENT_CREDIT, "studentId": "HS063" },
    { "id": "FT1760976094124", "description": "Học phí tháng 9", "type": TransactionType.ADJUSTMENT_DEBIT, "date": "2025-10-20", "amount": -350000, "studentId": "HS151" },
    { "id": "FT1760976132124", "type": TransactionType.ADJUSTMENT_DEBIT, "description": "Học phí tháng 9", "date": "2025-10-20", "studentId": "HS008", "amount": -250000 },
    { "id": "FT1760976164388", "studentId": "HS013", "type": TransactionType.ADJUSTMENT_DEBIT, "amount": -200000, "description": "Học phí tháng 9", "date": "2025-10-20" }
];
export const MOCK_INCOME: Income[] = [];
export const MOCK_EXPENSES: Expense[] = [];
export const MOCK_PAYROLLS: Payroll[] = [];
export const MOCK_ANNOUNCEMENTS: Announcement[] = [];

export const MOCK_SETTINGS: CenterSettings = {
    "name": "EduCenter Pro",
    "address": "Địa chỉ của bạn",
    "phone": "Số điện thoại của bạn",
    "logoUrl": "",
    "themeColor": "#4f46e5",
    "sidebarColor": "#111827",
    "theme": "dark",
    "onboardingStepsCompleted": ["students", "classes", "teachers"],
    "bankName": "",
    "bankAccountNumber": "",
    "bankAccountHolder": "",
    "bankBin": "",
    "qrCodeUrl": "",
    "adminPassword": "123456",
    "viewerAccountActive": true,
    "loginHeaderContent": "<p class=\"text-lg leading-7 text-indigo-200\">Hệ thống quản lý giáo dục thông minh.<br/>Toàn diện, hiệu quả và dễ sử dụng.</p>"
  };