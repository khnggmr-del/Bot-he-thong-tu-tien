const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ==================== CẤU HÌNH VIP ====================
const VIP_USER_ID = "1504052287969038357"; 
// ======================================================

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const DB_PATH = path.join(__dirname, 'database.json');
let databaseTuTien = {};
const dangDuongThuong = new Map(); 
const dangBeQuan = new Set(); 

const SHOP_ITEMS = {
    'tu_khi_dan': { ten: "Tụ Khí Đan 🍬", gia: 40, loai: "tuvi", giaTri: 50, mota: "Tăng trực tiếp 50 điểm Tu Vi." },
    'pha_chuong_dan': { ten: "Phá Chướng Đan 💊", gia: 150, loai: "tuvi", giaTri: 200, mota: "Tăng trực tiếp 200 điểm Tu Vi." },
    'hoa_u_dan': { ten: "Hóa Ứ Đan 🩸", gia: 100, loai: "duongthuong", mota: "Hồi phục vết thương ngay lập tức khi Đột phá thất bại." },
    'truc_co_dan': { ten: "Trúc Cơ Đan 💎", gia: 100, loai: "tile", giaTri: 15, apDung: "Luyện Khí", mota: "+15% tỷ lệ đột phá Luyện Khí." },
    'kim_dan_thao': { ten: "Kim Đan Thảo 🌿", gia: 250, loai: "tile", giaTri: 12, apDung: "Kết Đan", mota: "+12% tỷ lệ đột phá Kết Đan." },
    'nguyen_anh_dan': { ten: "Nguyên Anh Đan 🔮", gia: 500, loai: "tile", giaTri: 10, apDung: "Nguyên Anh", mota: "+10% tỷ lệ đột phá Nguyên Anh." },
    'hoa_than_dan': { ten: "Hóa Thần Đan 🌌", gia: 1000, loai: "tile", giaTri: 8, apDung: "Hóa Thần trở lên", mota: "+8% tỷ lệ đột phá Hóa Thần trở lên." },
    'ho_mach_dan': { ten: "Hộ Mạch Đan 🛡️", gia: 400, loai: "baohiem", giaTri: 15, mota: "Đột phá thất bại chỉ trừ 15% tu vi thay vì 50%." },
    'tc_loidinh': { ten: "Lôi Đình Thánh Thể ⚡", gia: 1000, loai: "thechat", value: "Lôi Đình Thánh Thể", mota: "Tăng +15% tỷ lệ Đột Phá vĩnh viễn ở mọi cảnh giới." },
    'tc_hoangco': { ten: "Hoang Cổ Thánh Thể 🌋", gia: 1500, loai: "thechat", value: "Hoang Cổ Thánh Thể", mota: "Nhân đôi (x2) Tốc Độ Bế Quan mặc định của Linh Căn!" },
    'tc_hondon': { ten: "Hỗn Độn Thần Thể 🌌", gia: 3000, loai: "thechat", value: "Hỗn Độn Thần Thể", mota: "+20% tỷ lệ đột phá & x1.5 Tốc độ bế quan." }
};

const CONG_PHAP_BOOK = {
    'cp_truongsinh': { ten: "Trường Sinh Quyết 🟢", gia: 200, phamChat: "Hoàng Cấp", he: "Mộc", buffSpd: 8, mota: "[Hoàng Cấp - Mộc] Tăng +8 tốc độ bế quan. (X2 nếu Linh căn hợp hệ Mộc)" },
    'cp_liethoaluan': { ten: "Liệt Hỏa Phần Thiên Luân 🔵", gia: 600, phamChat: "Huyền Cấp", he: "Hỏa", buffSpd: 20, mota: "[Huyền Cấp - Hỏa] Tăng +20 tốc độ bế quan. (X2 nếu Linh căn hợp hệ Hỏa)" },
    'cp_huyenbanggiam': { ten: "Huyền Băng Thần Giám 🟡", gia: 1500, phamChat: "Địa Cấp", he: "Thủy", buffSpd: 45, mota: "[Địa Cấp - Thủy] Tăng +45 tốc độ bế quan. (X2 nếu Linh căn hợp hệ Thủy)" },
    'cp_thaiuthankinh': { ten: "Thái Ất Kiếm Khí Thần Kinh 🔴", gia: 4000, phamChat: "Thiên Cấp", he: "Kim", buffSpd: 90, mota: "[Thiên Cấp - Kim] Tăng +90 tốc độ bế quan. (X2 nếu Linh căn hợp hệ Kim)" },
    'cp_daodaohongtran': { ten: "Đại Đạo & Hồng Trần Pháp Quyết 🌌", gia: 9999999, phamChat: "Chí Tôn Thần Pháp", he: "Toàn Hệ", buffSpd: 500, mota: "[Chí Tôn] Trên Tiên Đế dùng tăng 1000% Tốc độ bế quan & +100% Tỷ lệ đột phá" }
};

const nhanhChinh = [
    "Phàm Nhân", ...Array.from({ length: 13 }, (_, i) => `Luyện Khí Kỳ Tầng ${i + 1}`),
    "Trúc Cơ Sơ Kỳ", "Trúc Cơ Trung Kỳ", "Trúc Cơ Hậu Kỳ", "Trúc Cơ Viên Mãn",
    "Kết Đan Sơ Kỳ", "Kết Đan Trung Kỳ", "Kết Đan Hậu Kỳ", "Kết Đan Viên Mãn",
    "Nguyên Anh Sơ Kỳ", "Nguyên Anh Trung Kỳ", "Nguyên Anh Hậu Kỳ", "Nguyên Anh Viên Mãn",
    "Hóa Thần Sơ Kỳ", "Hóa Thần Trung Kỳ", "Hóa Thần Hậu Kỳ", "Hóa Thần Viên Mãn",
    "Luyện Hư Sơ Kỳ", "Luyện Hư Trung Kỳ", "Luyện Hư Hậu Kỳ", "Luyện Hư Viên Mãn",
    "Hợp Thể Sơ Kỳ", "Hợp Thể Trung Kỳ", "Hợp Thể Hậu Kỳ", "Hợp Thể Viên Mãn",
    "Đại Thừa Sơ Kỳ", "Đại Thừa Trung Kỳ", "Đại Thừa Hậu Kỳ", "Đại Thừa Viên Mãn",
    "Độ Kiếp Kỳ (Chuẩn Tiên)",
    "Hạ Vị Chân Tiên", "Trung Vị Chân Tiên", "Thượng Vị Chân Tiên", "Chân Tiên Viên Mãn",
    "Kim Tiên Sơ Kỳ", "Kim Tiên Trung Kỳ", "Kim Tiên Hậu Kỳ", "Kim Tiên Viên Mãn",
    "Thái Ất Ngọc Tiên Sơ Kỳ", "Thái Ất Ngọc Tiên Trung Kỳ", "Thái Ất Ngọc Tiên Hậu Kỳ", "Thái Ất Ngọc Tiên Viên Mãn",
    "Đại La Cảnh Sơ Kỳ", "Đại La Cảnh Trung Kỳ", "Đại La Cảnh Hậu Kỳ", "Đại La Cảnh Viên Mãn",
    "ĐẠO TỔ CHÍ CAO (TIÊN ĐẾ) 🌌"
];

const nhanhHongTran = [
    "[Hồng Trần] Phàm Nhân Tiên Cơ",
    ...Array.from({ length: 13 }, (_, i) => `[Hồng Trần] Luyện Khí Tiên Kỳ Tầng ${i + 1}`),
    "[Hồng Trần] Trúc Cơ Tiên Cảnh", "[Hồng Trần] Kết Đan Tiên Cảnh", "[Hồng Trần] Nguyên Anh Tiên Cảnh",
    "[Hồng Trần] Hóa Thần Tiên Cảnh", "[Hồng Trần] Luyện Hư Tiên Cảnh", "[Hồng Trần] Hợp Thể Tiên Cảnh",
    "[Hồng Trần] Đại Thừa Tiên Cảnh", "[Hồng Trần] Chân Tiên Cảnh Hồng Trần", "[Hồng Trần] Kim Tiên Cảnh Hồng Trần",
    "[Hồng Trần] Thái Ất Tiên Cảnh Hồng Trần", "[Hồng Trần] Đại La Tiên Cảnh Hồng Trần", 
    "🔮 HỒNG TRẦN TIÊN CẢNH (ĐỈNH PHONG)"
];

const nhanhVoThuong = [
    "Vô Thượng Cảnh", "Tịch Diệt Cảnh", "Diệt Đạo Cảnh", "Thiên Đạo Cảnh", "ĐẠI ĐẠO CHÍ CAO 🌌"
];

const danhSachLinhCan = [
    { ten: "Thiên Linh Căn [Cực Phẩm]", tyLe: 10, tocDo: 25, he: "Toàn Hệ" },
    { ten: "Dị Linh Căn [Thượng Phẩm]", tyLe: 25, tocDo: 18, he: "Hỏa" },
    { ten: "Chân Linh Căn [Trung Phẩm]", tyLe: 35, tocDo: 12, he: "Thủy" },
    { ten: "Ngụy Linh Căn [Hạ Phẩm]", tyLe: 30, tocDo: 6, he: "Mộc" }
];

function taiDuLieu() {
    try { if (fs.existsSync(DB_PATH)) databaseTuTien = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch (e) { databaseTuTien = {}; }
}

function luuDuLieu() {
    try { fs.writeFileSync(DB_PATH, JSON.stringify(databaseTuTien, null, 4)); } catch (e) {}
}

function khoiTaoUser(userId) {
    if (!databaseTuTien[userId]) {
        databaseTuTien[userId] = {
            linhCanTen: "Chưa thức tỉnh", tocDoTuLuyen: 0, tuViHienTai: 0, chiSoCanhGioi: 0,
            nhanhDao: "chinh", congPhapDangTu: null, linhThach: 0, thoiGianDangNhap: 0, theChat: [], tuiDo: {}, daoLu: null, nhiemVu: {}
        };
    }
    const p = databaseTuTien[userId];
    if (!p.nhanhDao) p.nhanhDao = "chinh";
    if (p.congPhapDangTu === undefined) p.congPhapDangTu = null;
    if (!Array.isArray(p.theChat)) p.theChat = typeof p.theChat === 'string' && p.theChat !== "Không có" ? [p.theChat] : [];
    if (!p.tuiDo) p.tuiDo = {};
    Object.keys(SHOP_ITEMS).forEach(k => { if (p.tuiDo[k] === undefined) p.tuiDo[k] = 0; });
    Object.keys(CONG_PHAP_BOOK).forEach(k => { if (p.tuiDo[k] === undefined) p.tuiDo[k] = 0; });
    const ngayChay = new Date().toDateString();
    if (!p.nhiemVu || p.nhiemVu.ngayHienTai !== ngayChay) {
        p.nhiemVu = { ngayHienTai: ngayChay, bqLan: 0, dpLan: 0, bqNhan: [false, false], dpNhan: [false, false] };
    }
    luuDuLieu();
}

function layTenCanhGioi(nhanh, idx) {
    if (nhanh === "hongtran") return nhanhHongTran[idx] || "Hồng Trần Cảnh";
    if (nhanh === "vothuong") return nhanhVoThuong[idx] || "Vô Thượng Thần Bí";
    return nhanhChinh[idx] || "Phàm Nhân";
}

function layTuViYeuCau(nhanh, idx) {
    if (nhanh === "vothuong") return 30000 + idx * 20000;
    if (nhanh === "hongtran") return 5000 + idx * 2000;
    
    if (idx <= 0) return 10;
    if (idx <= 13) return 100;
    if (idx <= 17) return 400;
    if (idx <= 21) return 800;
    if (idx <= 25) return 1500;
    if (idx <= 29) return 3000;
    if (idx <= 33) return 5000;
    if (idx <= 37) return 8000;
    if (idx <= 41) return 12000;
    return 15000 + (idx - 42) * 5000;
}

function laTrenTienDe(p) {
    if (p.nhanhDao === "hongtran" || p.nhanhDao === "vothuong") return true;
    if (p.nhanhDao === "chinh" && p.chiSoCanhGioi >= nhanhChinh.length - 1) return true;
    return false;
}

function laGiaiDoanPhamDenHoaThan(p) {
    if (p.nhanhDao !== "chinh") return false; 
    const cgTen = layTenCanhGioi(p.nhanhDao, p.chiSoCanhGioi);
    return cgTen === "Phàm Nhân" || cgTen.includes("Luyện Khí") || cgTen.includes("Trúc Cơ") || cgTen.includes("Kết Đan") || cgTen.includes("Nguyên Anh") || cgTen.includes("Hóa Thần");
}

function laGiaiDoanLuyenHuTroLen(p) {
    if (p.nhanhDao !== "chinh") return true; 
    const cgTen = layTenCanhGioi(p.nhanhDao, p.chiSoCanhGioi);
    return !laGiaiDoanPhamDenHoaThan(p) && cgTen !== "Phàm Nhân";
}

function laCanhGioiTienDe(p) {
    if (p.nhanhDao !== "chinh") return false;
    const cgTen = layTenCanhGioi(p.nhanhDao, p.chiSoCanhGioi);
    return cgTen.includes("TIÊN ĐẾ");
}

function layTyLeDotPha(nhanh, idx, p) {
    let tyLe = 5;
    if (nhanh === "vothuong") tyLe = Math.max(15 - idx * 3, 3);
    else if (nhanh === "hongtran") tyLe = Math.max(70 - idx * 2, 10);
    else tyLe = idx <= 13 ? 85 : idx <= 17 ? 65 : idx <= 21 ? 45 : idx <= 25 ? 30 : idx <= 29 ? 20 : idx <= 41 ? 12 : 5;
    
    if (p && Array.isArray(p.theChat)) {
        if (p.theChat.includes("Lôi Đình Thánh Thể")) tyLe += 15;
        if (p.theChat.includes("Hỗn Độn Thần Thể")) tyLe += 20;
        
        if (p.theChat.includes("Phàm Trần Nghịch Mệnh Thể")) {
            if (laGiaiDoanPhamDenHoaThan(p)) tyLe += 40; 
            if (laCanhGioiTienDe(p)) tyLe += 10; 
        }
    }
    
    if (p.congPhapDangTu === "cp_daodaohongtran" && laTrenTienDe(p)) {
        tyLe += 100; 
    }
    
    return tyLe;
}

function layTocDoBeseQuan(p) {
    let spd = p.tocDoTuLuyen || 5;
    if (p.nhanhDao === "hongtran") spd += 20; 
    
    if (p.theChat.includes("Hoang Cổ Thánh Thể")) spd *= 2;
    if (p.theChat.includes("Hỗn Độn Thần Thể")) spd *= 1.5;
    
    if (p.theChat.includes("Phàm Trần Nghịch Mệnh Thể")) {
        if (laGiaiDoanPhamDenHoaThan(p)) {
            spd *= 3.5; 
        } else if (laGiaiDoanLuyenHuTroLen(p)) {
            spd *= 5.5; 
        }
    }
    
    if (p.congPhapDangTu && CONG_PHAP_BOOK[p.congPhapDangTu]) {
        const cp = CONG_PHAP_BOOK[p.congPhapDangTu];
        if (p.congPhapDangTu === "cp_daodaohongtran" && laTrenTienDe(p)) {
            spd = spd * 11; 
        } else {
            let buffGoc = cp.buffSpd;
            if (p.linhCanTen.includes("Thiên Linh Căn") || p.linhCanTen.includes(cp.he)) {
                buffGoc *= 2; 
            }
            spd += buffGoc;
        }
    }
    
    return Math.floor(spd);
}

function kiemTraMaxDaiDao(p) {
    return (p.nhanhDao === "vothuong" && p.chiSoCanhGioi >= nhanhVoThuong.length - 1);
}

function tuXoaTinNhan(msg, thoiGian = 20000) {
    if (msg && typeof msg.delete === 'function') {
        setTimeout(() => msg.delete().catch(() => {}), thoiGian);
    }
}

async function batDauBeQuan(message, userId, isInteraction = false, interaction = null) {
    const userObj = isInteraction ? interaction.user : message.author;
    const p = databaseTuTien[userId];

    if (kiemTraMaxDaiDao(p)) {
        const txtMax = `🌌 Đạo hữu đã chứng đắc **ĐẠI ĐẠO CHÍ CAO**, vĩnh hằng bất diệt, không cần tu luyện nữa!`;
        if (isInteraction) return interaction.reply({ content: txtMax, ephemeral: true });
        return message.channel.send(`<@${userId}> ${txtMax}`).then(m => tuXoaTinNhan(m));
    }

    if (dangDuongThuong.has(userId) && Date.now() < dangDuongThuong.get(userId)) {
        const txt = `❌ Kinh mạch thương tổn, hãy mở \`!tuido\` cắn Hóa Ứ Đan để tiếp tục!`;
        if (isInteraction) return interaction.reply({ content: txt, ephemeral: true });
        return message.channel.send(`<@${userId}> ${txt}`).then(m => tuXoaTinNhan(m));
    }
    if (dangBeQuan.has(userId)) {
        if (isInteraction) return interaction.reply({ content: `⚠️ Đạo hữu đang bế quan rồi.`, ephemeral: true });
        return message.channel.send(`⚠️ Đạo hữu đang bế quan rồi.`).then(m => tuXoaTinNhan(m));
    }
    
    const maxTv = layTuViYeuCau(p.nhanhDao, p.chiSoCanhGioi);
    if (p.tuViHienTai >= maxTv) {
        if (isInteraction) return interaction.reply({ content: `⚠️ Tu vi viên mãn, hãy Đột Phá!`, ephemeral: true });
        return message.channel.send(`⚠️ Tu vi viên mãn, hãy gõ \`!dotpha\`!`).then(m => tuXoaTinNhan(m));
    }

    let dmChannel;
    try { dmChannel = await userObj.createDM(); } catch (err) {
        const chanDmTxt = `❌ Không thể gửi tin nhắn riêng! Hãy mở chế độ nhận tin nhắn từ thành viên cùng server.`;
        if (isInteraction) return interaction.reply({ content: chanDmTxt, ephemeral: true });
        return message.channel.send(`<@${userId}> ${chanDmTxt}`).then(m => tuXoaTinNhan(m));
    }

    dangBeQuan.add(userId);
    if (isInteraction) {
        await interaction.reply({ content: `🧘‍♂️ Tiến độ bế quan vận công đã được gửi ẩn vào Tin Nhắn Riêng!`, ephemeral: true });
    } else {
        message.channel.send(`🧘‍♂️ **<@${userId}>** đã nhập định bế quan. Tiến độ hiển thị trong tin nhắn riêng...`).then(m => tuXoaTinNhan(m, 5000));
    }

    let cpChuoi = p.congPhapDangTu ? `Vận hành: ${CONG_PHAP_BOOK[p.congPhapDangTu].ten}` : "Chưa vận hành công pháp";
    let msg = await dmChannel.send(`🧘‍♂️ Bắt đầu bế quan... Cảnh giới: **${layTenCanhGioi(p.nhanhDao, p.chiSoCanhGioi)}**\n📜 _(${cpChuoi})_`);
    
    const interval = setInterval(async () => {
        if (!dangBeQuan.has(userId)) return clearInterval(interval);
        p.tuViHienTai += layTocDoBeseQuan(p);
        
        if (p.tuViHienTai >= maxTv) {
            p.tuViHienTai = maxTv;
            p.nhiemVu.bqLan += 1;
            dangBeQuan.delete(userId);
            luuDuLieu();
            clearInterval(interval);
            await msg.edit(`✨ **Bế quan hoàn tất!** Chân khí viên mãn **[${maxTv}/${maxTv}]**. Quay lại kênh chung để đột phá phá vỡ gông xiềng.`).catch(() => {});
        } else {
            await msg.edit(`🧘‍♂️ Đang tu luyện... Tu vi: **[${p.tuViHienTai}/${maxTv}]** (+${layTocDoBeseQuan(p)}/2s)`).catch(() => clearInterval(interval));
        }
    }, 2000);
}

async function handleDotPha(message, userId, isInteraction = false, interaction = null) {
    const p = databaseTuTien[userId];

    if (kiemTraMaxDaiDao(p)) {
        const txtMax = `🌌 Bản thân đạo hữu đã chính là Đại Đạo, không thể vượt cấp thêm nữa!`;
        if (isInteraction) return interaction.reply({ content: txtMax, ephemeral: true });
        return message.channel.send(`<@${userId}> ${txtMax}`).then(m => tuXoaTinNhan(m));
    }

    const maxTv = layTuViYeuCau(p.nhanhDao, p.chiSoCanhGioi);
    if (p.tuViHienTai < maxTv) {
        if (isInteraction) return interaction.reply({ content: `❌ Tu vi chưa đủ viên mãn để đột phá.`, ephemeral: true });
        return message.channel.send(`❌ Tu vi chưa đủ viên mãn.`).then(m => tuXoaTinNhan(m));
    }

    if (p.nhanhDao === "chinh" && p.chiSoCanhGioi === nhanhChinh.length - 1) {
        const luaChonMenu = new StringSelectMenuBuilder().setCustomId('lua_chon_dai_dao').setPlaceholder('Chọn Con Đường Chứng Đạo Chí Cao...')
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel('🌸 Hồng Trần Tiên (Hóa Phàm Luyện Tâm)').setDescription('Trở lại làm Phàm Nhân tu luyện, bản chất mang lực lượng Tiên.').setValue('path_hongtran'),
                new StringSelectMenuOptionBuilder().setLabel('🌌 Vô Thượng Đại Đạo (Nghịch Chuyển Thiên Không)').setDescription('Tiến thẳng vào Vô Thượng Cảnh, hướng tới Đại Đạo Chí Cao.').setValue('path_vothuong')
            );
        const row = new ActionRowBuilder().addComponents(luaChonMenu);
        const txtChuyenNhanh = `🚨 **<@${userId}> CẢNH BÁO THIÊN ĐẠO!** Đạo hữu đã chạm tới đỉnh phong **Tiên Đế**. Chọn một ngã rẽ định mệnh để tiến lên:`;
        if (isInteraction) return interaction.reply({ content: txtChuyenNhanh, components: [row], ephemeral: true });
        return message.channel.send({ content: txtChuyenNhanh, components: [row] }).then(m => tuXoaTinNhan(m, 40000));
    }

    let tyLeThucTe = layTyLeDotPha(p.nhanhDao, p.chiSoCanhGioi, p);
    let chuoiDan = ""; let hoMach = false;
    const cgTen = layTenCanhGioi(p.nhanhDao, p.chiSoCanhGioi);

    if (p.nhanhDao === "chinh") {
        if (cgTen.includes("Luyện Khí") && p.tuiDo.truc_co_dan > 0) { p.tuiDo.truc_co_dan--; tyLeThucTe += 15; chuoiDan += " `Trúc Cơ Đan (+15%)` "; }
        else if (cgTen.includes("Kết Đan") && p.tuiDo.kim_dan_thao > 0) { p.tuiDo.kim_dan_thao--; tyLeThucTe += 12; chuoiDan += " `Kim Đan Thảo (+12%)` "; }
        else if (cgTen.includes("Nguyên Anh") && p.tuiDo.nguyen_anh_dan > 0) { p.tuiDo.nguyen_anh_dan--; tyLeThucTe += 10; chuoiDan += " `Nguyên Anh Đan (+10%)` "; }
        else if (p.tuiDo.hoa_than_dan > 0) { p.tuiDo.hoa_than_dan--; tyLeThucTe += 8; chuoiDan += " `Hóa Thần Đan (+8%)` "; }
    }
    if (p.tuiDo.ho_mach_dan > 0) { p.tuiDo.ho_mach_dan--; hoMach = true; chuoiDan += " `Hộ Mạch Đan (Bảo hiểm)` "; }

    let checkNhayCap = (tyLeThucTe >= 200);
    let tyLeXacSuat = Math.min(tyLeThucTe, 100); 
    p.nhiemVu.dpLan += 1;
    let thongBaoGoc;
    
    if (isInteraction) {
        await interaction.reply({ content: `⚡ Quy tắc chi lực tụ tập... Hãy đợi kết quả sau 2 giây!`, ephemeral: true });
    } else {
        thongBaoGoc = await message.channel.send(`⚡ Thiên địa biến sắc! Kiếp lôi giáng xuống <@${userId}>... Tổng vận khí tích lũy: **${tyLeThucTe}%** ${chuoiDan ? `\n💊 Phụ trợ: ${chuoiDan}` : ""}`);
    }
    
    setTimeout(() => {
        if (thongBaoGoc) tuXoaTinNhan(thongBaoGoc, 5000);
        const thongBaoKenh = message ? message.channel : client.channels.cache.get(interaction.channelId);

        if (Math.random() * 100 <= tyLeXacSuat) {
            let soCapTang = checkNhayCap ? 2 : 1;
            p.chiSoCanhGioi += soCapTang; p.tuViHienTai = 0;
            
            let mangCanhGioiHienTai = p.nhanhDao === "vothuong" ? nhanhVoThuong : p.nhanhDao === "hongtran" ? nhanhHongTran : nhanhChinh;
            if (p.chiSoCanhGioi >= mangCanhGioiHienTai.length) {
                p.chiSoCanhGioi = mangCanhGioiHienTai.length - 1;
            }

            let textThànhCông = checkNhayCap 
                ? `🔥 **[NGHỊCH THIÊN NHẢY CẤP]** Vận khí vượt ngưỡng đỉnh phong (${tyLeThucTe}%)! Tôn thượng <@${userId}> thân thể tích lũy đại bộc phát, **NHẢY VỌT LIỀN 2 TIỂU CẢNH GIỚI** thẳng tiến vị trí **${layTenCanhGioi(p.nhanhDao, p.chiSoCanhGioi)}**!`
                : `🎉 **[THÀNH CÔNG]** Chúc mừng tôn thượng <@${userId}> đột phá lên thành công vị trí **${layTenCanhGioi(p.nhanhDao, p.chiSoCanhGioi)}**!`;

            if (thongBaoKenh) thongBaoKenh.send(textThànhCông).then(m => tuXoaTinNhan(m));
        } else {
            let phanTram = hoMach ? 0.15 : 0.50;
            p.tuViHienTai -= Math.floor(p.tuViHienTai * phanTram);
            dangDuongThuong.set(userId, Date.now() + 20000); 
            const userObj = isInteraction ? interaction.user : message.author;
            userObj.send(`💥 **[THẤT BẠI]** Lôi kiếp quá mạnh! Đột phá thất bại, đạo hữu tổn thất ${(phanTram*100)}% tu vi và kinh mạch tê liệt 20 giây!`).catch(()=>{});
        }
        luuDuLieu();
    }, 2000);
}

// ==================== COMMAND PROCESSING ====================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const cmd = message.content.toLowerCase().trim();
    const userId = message.author.id;

    if (cmd === '!npt' && userId === VIP_USER_ID) {
        await message.delete().catch(() => {});
        khoiTaoUser(userId);
        databaseTuTien[userId] = {
            linhCanTen: "Thiên Linh Căn [Cực Phẩm]", tocDoTuLuyen: 150, tuViHienTai: layTuViYeuCau("chinh", nhanhChinh.length - 1), 
            chiSoCanhGioi: nhanhChinh.length - 1, nhanhDao: "chinh", congPhapDangTu: null, linhThach: 9999999,
            theChat: ["Hoang Cổ Thánh Thể", "Hỗn Độn Thần Thể", "Phàm Trần Nghịch Mệnh Thể"], tuiDo: {}, daoLu: "🌌 THIÊN ĐẠO CHÍ CAO", nhiemVu: {}
        }; 
        databaseTuTien[userId].tuiDo['cp_daodaohongtran'] = 1;
        luuDuLieu();
        return message.author.send(`🌌 **[VIP KHỞI ĐỘNG]** Đã cấp Tiên Đế & tích hợp thần thể nhảy vọt **"Phàm Trần Nghịch Mệnh Thể"**!`).catch(()=>{});
    }

    if (!cmd.startsWith('!')) return;
    setTimeout(() => message.delete().catch(() => {}), 5000);

    khoiTaoUser(userId);
    const p = databaseTuTien[userId];

    if (cmd === '!hethong') {
        let tcChuoi = p.theChat.length > 0 ? p.theChat.join(", ") : "Không có";
        let maxTv = layTuViYeuCau(p.nhanhDao, p.chiSoCanhGioi);
        let chuoiTuVi = kiemTraMaxDaiDao(p) ? "Vô hạn" : `${p.tuViHienTai}/${maxTv}`;
        let cpTen = p.congPhapDangTu ? CONG_PHAP_BOOK[p.congPhapDangTu].ten : "❌ Chưa tu luyện";
        
        let txt = `### 🌌 **[THẦN THỨC TU TIÊN]**\n• Đạo hữu: <@${userId}>\n• Cảnh giới: **${layTenCanhGioi(p.nhanhDao, p.chiSoCanhGioi)}** _(${chuoiTuVi})_\n• Bản mệnh Linh Căn: \`${p.linhCanTen}\`\n• Đang vận Công Pháp: **${cpTen}**\n• Đa Thể Chất: **[${tcChuoi}]**\n• Đạo Lữ: ${p.daoLu ? `💞 \`${p.daoLu}\`` : "❌ Cô độc cầu bại"}\n• Tài sản: **${p.linhThach}** Linh Thạch 💎`;
        
        const menu = new StringSelectMenuBuilder().setCustomId('menu_core').setPlaceholder('Hành động nhanh...');
        if (p.linhCanTen === "Chưa thức tỉnh") {
            menu.addOptions(new StringSelectMenuOptionBuilder().setLabel('🔮 Thức Tỉnh Linh Căn').setValue('lcan'));
        } else {
            if (!kiemTraMaxDaiDao(p)) {
                menu.addOptions(
                    new StringSelectMenuOptionBuilder().setLabel('🧘‍♂️ Bế Quan Tu Luyện (Gửi DM)').setValue('act_bequan'),
                    new StringSelectMenuOptionBuilder().setLabel('⚡ Đột Phá Cảnh Giới').setValue('act_dotpha')
                );
            } else {
                menu.addOptions(new StringSelectMenuOptionBuilder().setLabel('🌌 Đại Đạo Chí Cao (Vô thượng phong ấn)').setValue('disabled'));
                menu.setDisabled(true);
            }
        }
        return message.channel.send({ content: txt, components: [new ActionRowBuilder().addComponents(menu)] }).then(m => tuXoaTinNhan(m));
    }

    if (cmd === '!bequan') return batDauBeQuan(message, userId);
    if (cmd === '!dotpha') return handleDotPha(message, userId);

    if (cmd === '!shop') {
        const menuHangHoa = new StringSelectMenuBuilder().setCustomId('menu_shop_items').setPlaceholder('Mua Đan Dược & Thể Chất...')
            .addOptions(Object.entries(SHOP_ITEMS).map(([id, i]) => new StringSelectMenuOptionBuilder().setLabel(`${i.ten} - ${i.gia} LT`).setDescription(i.mota).setValue(id)));
        
        const menuCongPhap = new StringSelectMenuBuilder().setCustomId('menu_shop_congphap').setPlaceholder('Mua Bí Kíp Công Pháp Tâm Pháp...')
            .addOptions(Object.entries(CONG_PHAP_BOOK).map(([id, i]) => new StringSelectMenuOptionBuilder().setLabel(`${i.ten} - ${i.gia} LT`).setDescription(i.mota).setValue(id)));

        return message.channel.send({ 
            content: `### 🏪 **[THIÊN BẢO CÁC]**\nTài sản: **${p.linhThach}** LT. Hãy chọn thứ đan dược hoặc mật tịch muốn mua bên dưới:`, 
            components: [new ActionRowBuilder().addComponents(menuHangHoa), new ActionRowBuilder().addComponents(menuCongPhap)] 
        }).then(m => tuXoaTinNhan(m));
    }

    if (cmd === '!tuido') {
        let txt = `### 🎒 **[TÚI TRỮ VẬT]**\n`; 
        let hangNutDan = new ActionRowBuilder();
        let hangNutCp = new ActionRowBuilder();

        Object.entries(SHOP_ITEMS).forEach(([k, i]) => {
            if (p.tuiDo[k] > 0) txt += `• **${i.ten}**: \`${p.tuiDo[k]} viên\`\n`;
        });
        if (p.tuiDo.tu_khi_dan > 0) hangNutDan.addComponents(new ButtonBuilder().setCustomId('use_tkd').setLabel('Cắn Tụ Khí').setStyle(ButtonStyle.Primary));
        if (p.tuiDo.pha_chuong_dan > 0) hangNutDan.addComponents(new ButtonBuilder().setCustomId('use_pcd').setLabel('Cắn Phá Chướng').setStyle(ButtonStyle.Primary));
        if (p.tuiDo.hoa_u_dan > 0 && dangDuongThuong.has(userId)) hangNutDan.addComponents(new ButtonBuilder().setCustomId('use_hud').setLabel('Cắn Hóa Ứ Đan 🩸').setStyle(ButtonStyle.Danger));

        txt += `\n📜 **Mật tịch công pháp sở hữu:**\n`;
        let coCp = false;
        Object.entries(CONG_PHAP_BOOK).forEach(([k, i]) => {
            if (p.tuiDo[k] > 0) {
                coCp = true;
                txt += `• **${i.ten}**: \`Chưa luyện\` _(${i.phamChat} - Hệ ${i.he})\n`;
                if (hangNutCp.components.length < 5) {
                    hangNutCp.addComponents(new ButtonBuilder().setCustomId(`learn_${k}`).setLabel(`Tu luyện ${i.ten.split(' ')[0]}`).setStyle(ButtonStyle.Success));
                }
            }
        });
        if (!coCp) txt += `_Trống trơn, chưa có bí tịch nào._\n`;

        const giaPhanComponents = [];
        if (hangNutDan.components.length > 0) giaPhanComponents.push(hangNutDan);
        if (hangNutCp.components.length > 0) giaPhanComponents.push(hangNutCp);

        return message.channel.send({ content: txt, components: giaPhanComponents }).then(m => tuXoaTinNhan(m));
    }

    if (cmd === '!bxh') {
        const records = Object.entries(databaseTuTien).map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => {
                const priority = { "vothuong": 3, "hongtran": 2, "chinh": 1 };
                if (priority[b.nhanhDao] !== priority[a.nhanhDao]) return priority[b.nhanhDao] - priority[a.nhanhDao];
                if (b.chiSoCanhGioi !== a.chiSoCanhGioi) return b.chiSoCanhGioi - a.chiSoCanhGioi;
                return b.tuViHienTai - a.tuViHienTai;
            }).slice(0, 10);
        let txt = `### 🏆 **[THIÊN BẢNG ĐẠI NĂNG] - TOP 10 ĐẠI ĐẠO**\n`;
        if (records.length === 0) txt += `_Chưa có ai ghi danh._`;
        else records.forEach((u, i) => { txt += `${i===0?"🥇":i===1?"🥈":i===2?"🥉":`\`[#${i+1}]\``} <@${u.id}> - **${layTenCanhGioi(u.nhanhDao, u.chiSoCanhGioi)}**\n`; });
        return message.channel.send(txt).then(m => tuXoaTinNhan(m));
    }
    if (cmd === '!sanquai') {
        if (p.thoiGianSanQuai && Date.now() - p.thoiGianSanQuai < 15000) return message.channel.send(`⏳ Chờ hồi sức linh lực!`).then(m => tuXoaTinNhan(m));
        p.thoiGianSanQuai = Date.now(); let lt = Math.floor(Math.random() * 40) + 10; p.linhThach += lt; luuDuLieu();
        return message.channel.send(`⚔️ <@${userId}> giết Yêu Thú, nhận **${lt} Linh Thạch** 💎!`).then(m => tuXoaTinNhan(m));
    }
    if (cmd.startsWith('!ketduyen')) {
        const targetUser = message.mentions.users.first(); if (!targetUser || targetUser.id === userId) return message.channel.send(`❌ Tag người khác!`).then(m => tuXoaTinNhan(m));
        khoiTaoUser(targetUser.id); if (p.daoLu || databaseTuTien[targetUser.id].daoLu) return message.channel.send(`❌ Đã có đạo lữ!`).then(m => tuXoaTinNhan(m));
        p.daoLu = targetUser.username; databaseTuTien[targetUser.id].daoLu = message.author.username; luuDuLieu();
        return message.channel.send(`💞 **[THIÊN ĐẠO CHỨNG GIÁM]** Mối duyên trời định đã kết thành!`).then(m => tuXoaTinNhan(m));
    }
    if (cmd === '!nhiemvu') {
        let txt = `### 📜 **[BỔNG LỘC THIÊN ĐẠO]**\n• Bế quan hôm nay: \`[${p.nhiemVu.bqLan}/2]\` \n• Đột phá hôm nay: \`[${p.nhiemVu.dpLan}/1]\` \n`;
        const row = new ActionRowBuilder();
        if (p.nhiemVu.bqLan >= 2 && !p.nhiemVu.bqNhan[0]) row.addComponents(new ButtonBuilder().setCustomId('nv_bq').setLabel('Nhận thưởng Bế Quan').setStyle(ButtonStyle.Success));
        if (p.nhiemVu.dpLan >= 1 && !p.nhiemVu.dpNhan[0]) row.addComponents(new ButtonBuilder().setCustomId('nv_dp').setLabel('Nhận thưởng Đột Phá').setStyle(ButtonStyle.Success));
        return message.channel.send({ content: txt, components: row.components.length > 0 ? [row] : [] }).then(m => tuXoaTinNhan(m));
    }
    if (cmd === '!dangnhap') {
        if (Date.now() - p.thoiGianDangNhap < 21600000) return message.channel.send(`⏳ Quay lại sau!`).then(m => tuXoaTinNhan(m));
        p.linhThach += 150; p.thoiGianDangNhap = Date.now(); luuDuLieu();
        return message.channel.send(`💎 Thưởng hàng ngày: **+150 Linh Thạch!**`).then(m => tuXoaTinNhan(m));
    }
});

// ==================== INTERACTION PROCESSING ====================
client.on('interactionCreate', async (interaction) => {
    const userId = interaction.user.id;
    khoiTaoUser(userId);
    const p = databaseTuTien[userId];

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'lua_chon_dai_dao') {
            const pathSelected = interaction.values[0];
            if (pathSelected === 'path_hongtran') {
                p.nhanhDao = "hongtran"; p.chiSoCanhGioi = 0; p.tuViHienTai = 0;
                await interaction.reply({ content: `🌸 Đạo hữu bước vào **Hồng Trần Tiên**. Cảnh giới hiện tại: **${layTenCanhGioi(p.nhanhDao, 0)}**.` });
            } else if (pathSelected === 'path_vothuong') {
                p.nhanhDao = "vothuong"; p.chiSoCanhGioi = 0; p.tuViHienTai = 0;
                await interaction.reply({ content: `🌌 Đạo hữu chọn **Vô Thượng Đại Đạo** tiến vào **Vô Thượng Cảnh**!` });
            }
            luuDuLieu(); return;
        }

        if (interaction.customId === 'menu_shop_items') {
            const itemId = interaction.values[0]; const item = SHOP_ITEMS[itemId];
            if (p.linhThach < item.gia) return interaction.reply({ content: `❌ Không đủ Linh Thạch!`, ephemeral: true });
            if (item.loai === "thechat") {
                if (p.theChat.includes(item.value)) return interaction.reply({ content: `⚠️ Đã sở hữu thể chất này!`, ephemeral: true });
                p.theChat.push(item.value);
            } else { p.tuiDo[itemId]++; }
            p.linhThach -= item.gia; luuDuLieu();
            return interaction.reply({ content: `🛍️ Mua thành công **${item.ten}**!`, ephemeral: true });
        }

        if (interaction.customId === 'menu_shop_congphap') {
            const cpId = interaction.values[0]; const cpItem = CONG_PHAP_BOOK[cpId];
            if (p.linhThach < cpItem.gia) return interaction.reply({ content: `❌ Không đủ Linh Thạch để sở hữu tuyệt học này!`, ephemeral: true });
            if (p.tuiDo[cpId] > 0 || p.congPhapDangTu === cpId) return interaction.reply({ content: `⚠️ Đạo hữu đã có hoặc đang tu luyện công pháp này rồi!`, ephemeral: true });
            p.tuiDo[cpId] = 1; p.linhThach -= cpItem.gia; luuDuLieu();
            return interaction.reply({ content: `🛍️ Sở hữu thành công bí kíp **${cpItem.ten}**! Hãy gõ \`!tuido\` để tu luyện!`, ephemeral: true });
        }
        
        if (interaction.customId === 'menu_core') {
            const value = interaction.values[0];
            if (value === 'lcan') {
                if (p.linhCanTen !== "Chưa thức tỉnh") return interaction.reply({ content: `⚠️ Đã có linh căn.`, ephemeral: true });
                const lc = danhSachLinhCan[Math.floor(Math.random() * danhSachLinhCan.length)];
                p.linhCanTen = lc.ten; p.tocDoTuLuyen = lc.tocDo;
                
                let chuoiTheChatMoi = "";
                if (Math.random() * 100 <= 15) {
                    if (!p.theChat.includes("Phàm Trần Nghịch Mệnh Thể")) {
                        p.theChat.push("Phàm Trần Nghịch Mệnh Thể");
                        chuoiTheChatMoi = "\n🌸 **[DỊ TƯỢNG]** Đạo cốt chấn động, huyết mạch thức tỉnh bổ sung ẩn thể chất: **Phàm Trần Nghịch Mệnh Thể** (Mở khóa chuỗi buff tiến hóa và tính năng đột phá nhảy vọt)!";
                    }
                }
                
                luuDuLieu();
                return interaction.reply({ content: `🔮 Thức tỉnh bản mệnh thành công: **${lc.ten}**!${chuoiTheChatMoi}\nThử gõ \`!hethong\` để kiểm tra.` });
            }
            if (value === 'act_bequan') return batDauBeQuan(null, userId, true, interaction);
            if (value === 'act_dotpha') return handleDotPha(null, userId, true, interaction);
        }
    }

    if (interaction.isButton()) {
        const id = interaction.customId; const maxTv = layTuViYeuCau(p.nhanhDao, p.chiSoCanhGioi);
        if (id === 'use_tkd' && p.tuiDo.tu_khi_dan > 0) { p.tuiDo.tu_khi_dan--; p.tuViHienTai = Math.min(p.tuViHienTai + 50, maxTv); luuDuLieu(); }
        else if (id === 'use_pcd' && p.tuiDo.pha_chuong_dan > 0) { p.tuiDo.pha_chuong_dan--; p.tuViHienTai = Math.min(p.tuViHienTai + 200, maxTv); luuDuLieu(); }
        else if (id === 'use_hud' && p.tuiDo.hoa_u_dan > 0) { p.tuiDo.hoa_u_dan--; dangDuongThuong.delete(userId); luuDuLieu(); return interaction.reply({ content: `🩹 Kinh mạch đã phục hồi chấn thương!`, ephemeral: true }); }
        else if (id === 'nv_bq') { p.linhThach += 40; p.nhiemVu.bqNhan[0] = true; luuDuLieu(); return interaction.reply({ content: ` Thưởng +40 Linh Thạch!`, ephemeral: true }); }
        else if (id === 'nv_dp') { p.linhThach += 60; p.nhiemVu.dpNhan[0] = true; luuDuLieu(); return interaction.reply({ content: ` Thưởng +60 Linh Thạch!`, ephemeral: true }); }
        
        else if (id.startsWith('learn_')) {
            const cpId = id.replace('learn_', '');
            if (p.tuiDo[cpId] > 0) {
                if (p.congPhapDangTu) { p.tuiDo[p.congPhapDangTu] = 1; }
                p.tuiDo[cpId] = 0; p.congPhapDangTu = cpId; luuDuLieu();
                return interaction.reply({ content: `📜 Vận chuyển đại chu thiên thành công! Đạo hữu đã bắt đầu vận hành công pháp: **${CONG_PHAP_BOOK[cpId].ten}**!`, ephemeral: true });
            }
        }
        if (!interaction.replied) await interaction.update({ components: [] }).catch(() => {});
    }
});

taiDuLieu(); 
client.once('ready', () => { console.log(`✅ [THIÊN ĐẠO] Hệ thống tu tiên hoạt động trơn tru vĩnh hằng!`); });
const http = require('http');
http.createServer((req, res) => {
  res.write("Bot is running!");
  res.end();
}).listen(process.env.PORT || 3000);
client.login(process.env.NEW_SECRET)
