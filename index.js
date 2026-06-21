const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// ==================== MESSAGE PROCESSING ====================
client.on('messageCreate', async (message) => {
    // Chặn bot tự đọc tin nhắn của chính nó để không bị lỗi phản hồi 2 lần
    if (message.author.bot) return;

    const userId = message.author.id;
    khoiTaoUser(userId);
    const p = databaseTuTien[userId];
    const cmd = message.content;

    if (cmd.startsWith('!sanquai')) {
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

// Kết nối cổng để chạy ổn định trên Render
const http = require('http');
http.createServer((req, res) => {
  res.write("Bot is running!");
  res.end();
}).listen(process.env.PORT || 3000);

client.login(process.env.NEW_SECRET);
