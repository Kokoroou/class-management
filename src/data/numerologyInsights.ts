/**
 * Nội dung diễn giải thần số học — tách riêng khỏi logic hiển thị (sidebar) để
 * sau này dễ chỉnh sửa, bổ sung hoặc lược bớt mà không cần đụng vào component.
 */

export type NumerologyMetricKey = 'lifePath' | 'expression' | 'soulUrge' | 'personality' | 'birthDay';

export interface NumerologyMetricDef {
  key: NumerologyMetricKey;
  label: string;
  subtitle: string;
  /** Giải thích cách tính và ý nghĩa tổng quát của chỉ số. */
  description: string;
  /** true nếu chỉ số này cần cột Họ và tên đầy đủ mới tính được. */
  requiresFullName: boolean;
}

export const NUMEROLOGY_METRICS: NumerologyMetricDef[] = [
  {
    key: 'lifePath',
    label: 'Số chủ đạo',
    subtitle: 'Life Path Number',
    description:
      'Tính từ tổng các chữ số trong ngày sinh (ngày, tháng, năm). Đây là chỉ số quan trọng nhất, thể hiện con đường phát triển và bài học lớn xuyên suốt cuộc đời.',
    requiresFullName: false,
  },
  {
    key: 'expression',
    label: 'Số sứ mệnh',
    subtitle: 'Expression / Destiny Number',
    description:
      'Tính từ tổng giá trị chữ cái trong họ và tên đầy đủ. Thể hiện tài năng bẩm sinh và định hướng phát huy năng lực của học sinh.',
    requiresFullName: true,
  },
  {
    key: 'soulUrge',
    label: 'Số linh hồn',
    subtitle: 'Soul Urge Number',
    description:
      'Tính từ các nguyên âm trong họ và tên. Thể hiện mong muốn và động lực nội tâm thực sự — điều học sinh thực sự khao khát dù có thể không nói ra.',
    requiresFullName: true,
  },
  {
    key: 'personality',
    label: 'Số nhân cách',
    subtitle: 'Personality Number',
    description:
      'Tính từ các phụ âm trong họ và tên. Thể hiện ấn tượng đầu tiên mà học sinh tạo ra với thầy cô, bạn bè xung quanh.',
    requiresFullName: true,
  },
  {
    key: 'birthDay',
    label: 'Số ngày sinh',
    subtitle: 'Birth Day Number',
    description:
      'Tính riêng từ ngày sinh trong tháng (không gồm tháng, năm). Thể hiện một năng khiếu hoặc điểm mạnh cụ thể, bổ trợ thêm cho Số chủ đạo.',
    requiresFullName: false,
  },
];

export interface NumberInsight {
  /** Tên gọi ngắn gọn cho con số, dùng làm tiêu đề trong sidebar. */
  keyword: string;
  /** (1) Ý nghĩa / đặc điểm tính cách ứng với con số. */
  personality: string;
  /** (2) Gợi ý cách giao bài tập / phương pháp học phù hợp. */
  studyTip: string;
  /** (3) Gợi ý cách giao tiếp để khuyến khích học sinh. */
  communicationTip: string;
}

/**
 * Diễn giải theo từng con số (1-9, 11, 22, 33), dùng chung cho cả 5 chỉ số
 * (Số chủ đạo, Số sứ mệnh, Số linh hồn, Số nhân cách, Số ngày sinh) — vì cốt lõi
 * đặc điểm của một con số là như nhau, chỉ khác ở "khía cạnh" mà mỗi chỉ số phản ánh
 * (xem NUMEROLOGY_METRICS.description).
 */
export const NUMBER_INSIGHTS: Record<number, NumberInsight> = {
  1: {
    keyword: 'Người tiên phong',
    personality:
      'Có tinh thần độc lập cao, thích tự đưa ra quyết định và không ngại thử cái mới. Tự tin, quyết đoán, đôi khi nóng vội vì muốn về đích trước. Có tố chất lãnh đạo tự nhiên nhưng dễ khó chịu khi bị áp đặt cách làm.',
    studyTip:
      'Nên giao các nhiệm vụ có tính thử thách, để học sinh tự chọn cách giải quyết thay vì áp một quy trình cứng nhắc. Bài tập dạng dự án cá nhân, thi đua hoặc vai trò trưởng nhóm sẽ phát huy tốt sự chủ động. Tránh giao việc lặp đi lặp lại hoặc giám sát quá sát sao.',
    communicationTip:
      'Trao đổi thẳng thắn, ngắn gọn, tôn trọng ý kiến và cho các em quyền lựa chọn trong khuôn khổ cho phép. Khen ngợi sự chủ động thay vì chỉ khen kết quả, tránh ra lệnh trực tiếp — nên gợi mở để các em tự nhận ra hướng đi đúng.',
  },
  2: {
    keyword: 'Người kết nối',
    personality:
      'Nhạy cảm, tinh tế, rất giỏi lắng nghe và dung hòa các ý kiến khác nhau. Coi trọng sự hòa thuận, dễ đồng cảm với bạn bè nhưng cũng dễ bị ảnh hưởng bởi cảm xúc của người khác và ngại xung đột.',
    studyTip:
      'Phù hợp với hoạt động học theo cặp, nhóm nhỏ hoặc bài tập cần hợp tác, phản hồi qua lại. Nên tránh đặt các em vào tình huống cạnh tranh gay gắt một mình hoặc thuyết trình trước đám đông ngay từ đầu mà chưa có bước chuẩn bị tâm lý.',
    communicationTip:
      'Nói chuyện nhẹ nhàng, kiên nhẫn, dành thời gian hỏi cảm nhận của các em trước khi góp ý. Khen riêng tư thay vì trước lớp sẽ hiệu quả hơn, và nên nhấn mạnh giá trị của những đóng góp thầm lặng, không chỉ thành tích nổi bật.',
  },
  3: {
    keyword: 'Người sáng tạo',
    personality:
      'Hoạt bát, giàu trí tưởng tượng, thích thể hiện bản thân qua lời nói, hình ảnh hoặc nghệ thuật. Năng lượng tích cực, hài hước, nhưng dễ mất tập trung nếu nhiệm vụ quá khô khan hoặc kéo dài.',
    studyTip:
      'Nên lồng ghép yếu tố sáng tạo vào bài tập: thuyết trình, vẽ sơ đồ, kể chuyện, đóng vai thay vì chỉ làm bài viết thuần túy. Chia nhỏ nhiệm vụ thành các phần ngắn, có điểm dừng để duy trì hứng thú.',
    communicationTip:
      'Giao tiếp vui vẻ, cởi mở, cho các em cơ hội được nói và được lắng nghe. Khuyến khích bằng sự công nhận công khai (lời khen trước lớp, trưng bày sản phẩm) sẽ tạo động lực mạnh mẽ.',
  },
  4: {
    keyword: 'Người xây nền',
    personality:
      'Cẩn thận, có trách nhiệm, làm việc theo trình tự và rất đáng tin cậy. Kiên trì với mục tiêu dài hạn nhưng có thể cứng nhắc, ngại thay đổi kế hoạch đã đặt ra.',
    studyTip:
      'Phù hợp với bài tập có cấu trúc rõ ràng, checklist, thời hạn cụ thể theo từng bước. Nên giao trước lịch trình và tiêu chí đánh giá cụ thể để các em yên tâm thực hiện, tránh thay đổi yêu cầu đột ngột giữa chừng.',
    communicationTip:
      'Trao đổi rõ ràng, cụ thể, tránh nói mơ hồ chung chung. Ghi nhận sự bền bỉ, kỷ luật của các em, đồng thời khuyến khích thử một vài thay đổi nhỏ để tăng sự linh hoạt.',
  },
  5: {
    keyword: 'Người khám phá',
    personality:
      'Năng động, ham thích trải nghiệm mới, thích tự do và dễ thích nghi với thay đổi. Tò mò, nhanh nhạy nhưng dễ chán nếu phải lặp lại một việc quá lâu, đôi khi thiếu kiên nhẫn.',
    studyTip:
      'Nên đa dạng hóa hình thức học: trò chơi, thực hành, học ngoài lớp, xen kẽ nhiều hoạt động thay vì một bài tập kéo dài. Cho phép các em lựa chọn giữa vài cách tiếp cận khác nhau để hoàn thành cùng một mục tiêu.',
    communicationTip:
      'Giao tiếp linh hoạt, hài hước, tránh gò bó bằng quy tắc quá cứng nhắc. Nhấn mạnh sự tự do trong khuôn khổ, nhắc nhở nhẹ nhàng về cam kết hoàn thành thay vì áp đặt kỷ luật gắt gao.',
  },
  6: {
    keyword: 'Người chăm sóc',
    personality:
      'Chu đáo, giàu trách nhiệm với tập thể, luôn quan tâm đến cảm xúc và lợi ích chung của bạn bè, gia đình. Có xu hướng cầu toàn và đôi khi ôm đồm việc của người khác.',
    studyTip:
      'Phù hợp với vai trò hỗ trợ bạn học, nhóm trưởng chăm sóc thành viên, hoặc các dự án phục vụ cộng đồng lớp học. Nên nhắc các em cân bằng giữa việc giúp đỡ người khác và hoàn thành nhiệm vụ của chính mình.',
    communicationTip:
      'Thể hiện sự quan tâm chân thành trước khi trao đổi về học tập, công nhận vai trò của các em trong tập thể. Khuyến khích các em đặt ranh giới lành mạnh, không nên tự nhận trách nhiệm quá mức.',
  },
  7: {
    keyword: 'Người phân tích',
    personality:
      'Trầm tĩnh, thích suy ngẫm sâu, ham tìm hiểu bản chất vấn đề hơn là làm theo khuôn mẫu có sẵn. Độc lập trong tư duy, đôi khi khép kín và ngại chia sẻ suy nghĩ với người khác.',
    studyTip:
      'Phù hợp với bài tập nghiên cứu, câu hỏi mở, thời gian tự học yên tĩnh để suy nghĩ thấu đáo trước khi trình bày. Tránh ép các em trả lời ngay lập tức trước đám đông khi chưa kịp chuẩn bị.',
    communicationTip:
      'Trao đổi riêng tư, tôn trọng khoảng lặng suy nghĩ của các em, không thúc giục. Đặt câu hỏi gợi mở thay vì chất vấn dồn dập sẽ giúp các em cởi mở chia sẻ hơn.',
  },
  8: {
    keyword: 'Người thực thi',
    personality:
      'Có chí hướng, quyết tâm cao, giỏi tổ chức và luôn hướng đến kết quả, thành tích cụ thể. Tự tin, năng lực quản lý tốt nhưng đôi khi tự đặt áp lực thành tích lên chính mình quá lớn.',
    studyTip:
      "Nên giao mục tiêu rõ ràng kèm thước đo thành công cụ thể (điểm số, cột mốc, bảng xếp hạng tiến độ). Vai trò quản lý dự án nhóm hoặc thử thách có tính cạnh tranh lành mạnh sẽ phát huy thế mạnh của các em.",
    communicationTip:
      'Trao đổi thẳng vào trọng tâm, tôn trọng năng lực và cho các em quyền chủ động tổ chức công việc. Nhắc nhở các em rằng giá trị bản thân không chỉ nằm ở kết quả, tránh gây áp lực thành tích quá mức.',
  },
  9: {
    keyword: 'Người vị nhân',
    personality:
      'Bao dung, giàu lòng trắc ẩn, quan tâm đến những vấn đề lớn hơn bản thân như bạn bè, cộng đồng. Có tầm nhìn rộng, dễ đồng cảm nhưng đôi khi mơ mộng, thiếu tập trung vào chi tiết cụ thể.',
    studyTip:
      'Phù hợp với các dự án mang ý nghĩa xã hội, thiện nguyện, hoặc chủ đề gắn với giá trị nhân văn. Nên giúp các em chia nhỏ mục tiêu lớn thành các bước cụ thể để không bị choáng ngợp hoặc sa vào lý tưởng chung chung.',
    communicationTip:
      'Khơi gợi ý nghĩa và giá trị của nhiệm vụ thay vì chỉ nói về lợi ích cá nhân. Ghi nhận sự bao dung, đồng cảm của các em, đồng thời hướng dẫn cụ thể để ý tưởng lớn được hiện thực hóa.',
  },
  11: {
    keyword: 'Số chủ trực giác',
    personality:
      'Nhạy cảm và giàu trực giác vượt trội, dễ cảm nhận được cảm xúc, bầu không khí xung quanh. Có tiềm năng truyền cảm hứng cho người khác nhưng cũng dễ căng thẳng, quá tải cảm xúc vì nhạy cảm hơn bình thường.',
    studyTip:
      'Phù hợp với các hoạt động cần sự tinh tế: nghệ thuật, viết lách, thuyết trình truyền cảm hứng. Nên giao nhiệm vụ theo nhịp độ vừa phải, xen kẽ thời gian nghỉ ngơi để tránh quá tải cảm xúc.',
    communicationTip:
      'Trò chuyện nhẹ nhàng, chân thành, tạo không gian an toàn để các em bộc lộ cảm xúc. Khích lệ các em tin vào trực giác của mình, đồng thời giúp các em học cách giữ bình tĩnh trước áp lực.',
  },
  22: {
    keyword: 'Số chủ kiến tạo',
    personality:
      'Có tầm nhìn lớn kết hợp khả năng tổ chức thực tế, thường nghĩ đến những mục tiêu quy mô và cách hiện thực hóa chúng. Kỷ luật, tham vọng, nhưng đôi khi tự đặt kỳ vọng quá cao khiến bản thân áp lực.',
    studyTip:
      'Phù hợp với các dự án dài hơi, có tính hệ thống, cho phép các em lập kế hoạch và triển khai từng giai đoạn. Nên hướng dẫn các em chia nhỏ mục tiêu lớn để tránh choáng ngợp và giữ được động lực xuyên suốt.',
    communicationTip:
      'Trao đổi ở tầm nhìn dài hạn, công nhận khả năng tổ chức và ý tưởng lớn của các em. Nhắc nhở nhẹ nhàng để các em không tự tạo áp lực quá mức lên bản thân, và ăn mừng cả những cột mốc nhỏ.',
  },
  33: {
    keyword: 'Số chủ vị tha',
    personality:
      'Giàu tình thương, sẵn sàng hỗ trợ, hướng dẫn và chăm lo cho người khác một cách vô điều kiện. Ấm áp, trách nhiệm cao với tập thể nhưng dễ quên chăm sóc chính nhu cầu của bản thân.',
    studyTip:
      'Phù hợp với vai trò hướng dẫn bạn học, gia sư nhỏ trong lớp, hoặc các dự án chăm sóc cộng đồng. Nên khuyến khích các em tham gia hoạt động nhóm có ý nghĩa, đồng thời nhắc các em dành thời gian cho việc học của riêng mình.',
    communicationTip:
      'Thể hiện sự trân trọng với những đóng góp thầm lặng của các em cho tập thể. Khuyến khích các em chia sẻ khó khăn của bản thân, tránh để các em luôn đặt nhu cầu người khác lên trên nhu cầu chính mình.',
  },
};

/** Các nhóm Số chủ đạo phổ biến, dùng để mô tả mức độ hòa hợp chung theo nhóm. */
export const LIFE_PATH_GROUPS: Record<string, { label: string; numbers: number[] }> = {
  independent: { label: 'Độc lập & Lý trí', numbers: [1, 5, 7] },
  foundation: { label: 'Nền tảng & Hợp tác', numbers: [2, 4, 6] },
  social: { label: 'Xã hội & Lãnh đạo', numbers: [3, 8, 9] },
  master: { label: 'Số chủ đặc biệt', numbers: [11, 22, 33] },
};

export interface CompatibilityInsight {
  bestWith: string;
  considerWith: string;
  tip: string;
}

/**
 * Gợi ý hòa đồng/hợp tác dựa trên Số chủ đạo, mô tả chung theo nhóm số
 * (không so sánh từng học sinh cụ thể trong lớp).
 */
export const LIFE_PATH_COMPATIBILITY: Record<number, CompatibilityInsight> = {
  1: {
    bestWith:
      "Hợp với nhóm 'Xã hội & Lãnh đạo' (3, 8, 9) — các bạn này tạo động lực và không gian để số 1 dẫn dắt, đôi bên bổ trợ tốt trong công việc nhóm.",
    considerWith:
      "Cần thêm thời gian làm quen với nhóm 'Nền tảng & Hợp tác' (2, 4, 6) vì số 1 thích tốc độ, tự quyết trong khi nhóm này ưu tiên sự thận trọng, dễ nảy sinh sốt ruột đôi bên.",
    tip: "Khi ghép nhóm, có thể để số 1 làm trưởng nhóm nhưng nên ghép cùng ít nhất một bạn nhóm 'Nền tảng' để cân bằng nhịp độ làm việc.",
  },
  2: {
    bestWith:
      "Hợp với các bạn cùng nhóm 'Nền tảng & Hợp tác' (2, 4, 6) và nhóm 'Số chủ đặc biệt' (11, 22, 33) — cả hai đều coi trọng sự tận tâm, gắn kết bền vững.",
    considerWith:
      "Cần thêm thời gian với nhóm 'Độc lập & Lý trí' (1, 5, 7) vì số 2 dễ bị lấn át nếu bạn cùng nhóm quá quyết đoán, áp đặt.",
    tip: "Khi ghép nhóm, tránh để số 2 làm việc một mình với một bạn số 1 hoặc 8 quá mạnh mẽ mà không có người thứ ba cân bằng.",
  },
  3: {
    bestWith:
      "Hợp với nhóm 'Xã hội & Lãnh đạo' (3, 8, 9) và nhóm 'Độc lập & Lý trí' (1, 5, 7) — cả hai đều mang năng lượng chủ động, dễ tạo không khí sôi nổi.",
    considerWith:
      "Cần thêm thời gian với nhóm 'Nền tảng & Hợp tác' (2, 4, 6) vì số 3 thích sự linh hoạt trong khi nhóm này ưu tiên quy trình chặt chẽ.",
    tip: "Khi ghép nhóm, nên để số 3 đảm nhận phần trình bày, sáng tạo nội dung, kết hợp với một bạn tỉ mỉ hơn để hoàn thiện chi tiết.",
  },
  4: {
    bestWith:
      "Hợp với nhóm 'Nền tảng & Hợp tác' (2, 4, 6) và nhóm 'Số chủ đặc biệt' (11, 22, 33) — cùng coi trọng kế hoạch rõ ràng và sự bền bỉ.",
    considerWith:
      "Cần thêm thời gian với nhóm 'Độc lập & Lý trí' (1, 5, 7), đặc biệt số 5, vì sự thay đổi liên tục dễ khiến số 4 mất phương hướng.",
    tip: "Khi ghép nhóm, nên giao cho số 4 vai trò giữ tiến độ, lịch trình chung — giúp các em phát huy thế mạnh và ổn định cả nhóm.",
  },
  5: {
    bestWith:
      "Hợp với nhóm 'Xã hội & Lãnh đạo' (3, 8, 9) vì cả hai đều thích sự sôi động, dễ cùng nhau tạo ra ý tưởng mới mẻ.",
    considerWith:
      "Cần thêm thời gian với nhóm 'Nền tảng & Hợp tác' (2, 4, 6) do số 5 ưa thay đổi còn nhóm này thích sự ổn định, ít biến động.",
    tip: "Nên cho số 5 luân phiên vai trò trong nhóm thay vì gắn cố định một vị trí lâu dài, giúp các em duy trì hứng thú hợp tác.",
  },
  6: {
    bestWith:
      "Hợp với nhóm 'Nền tảng & Hợp tác' (2, 4, 6) và nhóm 'Số chủ đặc biệt' (11, 22, 33) — cả hai đều coi trọng sự quan tâm, chăm sóc lẫn nhau.",
    considerWith:
      "Cần thêm thời gian với nhóm 'Xã hội & Lãnh đạo' (3, 8, 9) vì số 6 có thể cảm thấy bị bỏ quên nếu bạn cùng nhóm quá tập trung vào thành tích cá nhân.",
    tip: "Khi ghép nhóm, số 6 phù hợp với vai trò hỗ trợ, chăm sóc tinh thần cả nhóm — nên ghi nhận vai trò này thay vì chỉ đánh giá qua kết quả.",
  },
  7: {
    bestWith:
      "Hợp với nhóm 'Số chủ đặc biệt' (11, 22, 33) và một số bạn nhóm 'Nền tảng & Hợp tác' (2, 4, 6) — cả hai đều coi trọng chiều sâu suy nghĩ hơn là sự ồn ào.",
    considerWith:
      "Cần thêm thời gian với nhóm 'Xã hội & Lãnh đạo' (3, 8, 9) vì nhịp độ sôi nổi, hướng ngoại của nhóm này có thể khiến số 7 cảm thấy quá tải.",
    tip: "Khi ghép nhóm, nên cho số 7 một khoảng không gian yên tĩnh riêng trong hoạt động nhóm thay vì ép các em hòa vào không khí ồn ào ngay từ đầu.",
  },
  8: {
    bestWith:
      "Hợp với nhóm 'Xã hội & Lãnh đạo' (3, 8, 9) và nhóm 'Độc lập & Lý trí' (1, 5, 7) — cùng hướng đến hiệu quả và kết quả rõ ràng.",
    considerWith:
      "Cần thêm thời gian với nhóm 'Nền tảng & Hợp tác' (2, 4, 6) vì số 8 có thể vô tình tạo áp lực thành tích lên các bạn thích nhịp độ chậm rãi hơn.",
    tip: "Khi ghép nhóm, số 8 phù hợp vai trò tổ chức, phân công công việc — nên nhắc các em lắng nghe ý kiến của bạn nhóm 'Nền tảng' thay vì chỉ tập trung vào tiến độ.",
  },
  9: {
    bestWith:
      "Hợp với nhóm 'Xã hội & Lãnh đạo' (3, 8, 9) và nhóm 'Số chủ đặc biệt' (11, 22, 33) — cùng coi trọng giá trị nhân văn và tầm nhìn rộng.",
    considerWith:
      "Cần thêm thời gian với nhóm 'Độc lập & Lý trí' (1, 5, 7) vì số 9 hướng đến lợi ích chung trong khi nhóm này ưu tiên tính hiệu quả cá nhân.",
    tip: "Khi ghép nhóm, nên giao cho số 9 vai trò kết nối, truyền cảm hứng — phù hợp làm cầu nối giữa các thành viên có tính cách khác biệt.",
  },
  11: {
    bestWith:
      "Hợp với nhóm 'Nền tảng & Hợp tác' (2, 4, 6) — được nhóm này nâng đỡ, tạo cảm giác an toàn để số 11 phát huy trực giác và sự tinh tế.",
    considerWith:
      "Cần thêm không gian khi ở cùng nhóm 'Xã hội & Lãnh đạo' (3, 8, 9) vì năng lượng sôi nổi của nhóm này có thể khiến số 11 dễ quá tải cảm xúc.",
    tip: "Khi ghép nhóm, không nên để số 11 một mình xử lý xung đột nhóm — nên có một bạn 'Nền tảng & Hợp tác' hỗ trợ giữ ổn định.",
  },
  22: {
    bestWith:
      "Hợp với nhóm 'Nền tảng & Hợp tác' (2, 4, 6) — nhóm này giúp hiện thực hóa những ý tưởng lớn của số 22 thành các bước cụ thể.",
    considerWith:
      "Cần thêm thời gian với nhóm 'Độc lập & Lý trí' (1, 5, 7), đặc biệt số 5, vì sự thay đổi kế hoạch liên tục dễ làm gián đoạn tầm nhìn dài hạn của số 22.",
    tip: "Khi ghép nhóm, nên để số 22 giữ vai trò định hướng chiến lược cho dự án dài hơi, kết hợp với các bạn tỉ mỉ để triển khai chi tiết.",
  },
  33: {
    bestWith:
      "Hợp với nhóm 'Nền tảng & Hợp tác' (2, 4, 6) và các bạn nhóm 'Xã hội & Lãnh đạo' theo hướng phục vụ tập thể — cả hai đều trân trọng sự tận tâm của số 33.",
    considerWith:
      "Cần thêm thời gian với nhóm 'Độc lập & Lý trí' (1, 5, 7) vì tính tự chủ mạnh của nhóm này đôi khi khiến số 33 cảm thấy nỗ lực chăm sóc của mình chưa được ghi nhận.",
    tip: "Khi ghép nhóm, nên nhắc số 33 rằng các em cũng cần được hỗ trợ, không chỉ luôn là người cho đi trong nhóm.",
  },
};
