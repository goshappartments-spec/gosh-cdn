(function() {
  'use strict';

  // ============= DATA =============
  var PH = 'https://secure.travelline.ru';
  var BK = 'https://gosh.rent/booking?hotel_id=2&be-room=';

  var photos = {
    197138: "/resource/thumb/400x300/rt/197138/637926967314112892-b995740b-adf5-4dca-b4e4-b07d5420ed4d?s=637926967315600000",
    197139: "/resource/thumb/400x300/rt/197139/637926972168988991-a8af922c-8b24-4d4d-963b-18e0608861e8?s=637926972172230000",
    197149: "/resource/thumb/400x300/rt/197149/638219326520034676-8a1517be-2a75-45d4-b716-8955e5e0d855?s=638219326523200000",
    197151: "/resource/thumb/400x300/rt/197151/638410237418236397-fd6fc7ef-a740-48af-8e69-d815ffb22749?s=638410237424500000",
    197152: "/resource/thumb/400x300/rt/197152/637926998017819313-f04e2e9d-1ee3-4a9d-aeca-adf1b5807042?s=637926998023070000",
    197156: "/resource/thumb/400x300/rt/197156/637927010977466751-ed90701d-e935-45fa-89d9-2f9f7d5b0962?s=637927010982500000",
    197160: "/resource/thumb/400x300/rt/197160/637927014805516989-8d1ae49b-83ea-48c4-aa88-3e8f69861476?s=637927014810670000",
    197163: "/resource/thumb/400x300/rt/197163/638805704244143388-b1d8e811-e3b9-474b-8159-9924de526fda?s=638805704255870000",
    197165: "/resource/thumb/400x300/rt/197165/637927025582852260-05446aaf-99f8-4093-b98b-43832432d3c4?s=637927025585870000",
    197169: "/resource/thumb/400x300/rt/197169/637927030567321349-76775677-63c1-4ac1-b5d7-ab05c27ec0ca?s=637927030571200000",
    197173: "/resource/thumb/400x300/rt/197173/639022616339445471-7568ca7b-9cad-40c3-9990-1a07ba13106b?s=639022616366700000",
    197179: "/resource/thumb/400x300/rt/197179/638159882406542327-b6175525-6c3a-449e-ab94-a97a21fb0944?s=638159882418800000",
    197200: "/resource/thumb/400x300/rt/197200/639020361304025697-330068c7-1880-4e5a-b814-45819578cea0?s=639020361315800000",
    197208: "/resource/thumb/400x300/rt/197208/637927069265898491-ee4c99a2-a0d2-4160-a094-e186231a08b3?s=637927069271600000",
    197214: "/resource/thumb/400x300/rt/197214/637927074358115340-7530b527-ab18-49ee-9608-57f0bf6ae3ad?s=637927074361530000",
    197221: "/resource/thumb/400x300/rt/197221/639058993852224868-c24b9f4b-d151-488e-94a5-3c78f65e95be?s=639058993857970000",
    197222: "/resource/thumb/400x300/rt/197222/638989141400403926-955c4bfc-9931-486c-9480-0c81b7904508?s=638989141411770000",
    197227: "/resource/thumb/400x300/rt/197227/638524926856937944-be8d2210-c9f5-42ae-bd5d-f746aaa61b07?s=638524926866670000",
    197232: "/resource/thumb/400x300/rt/197232/637927089294911382-d1f69cdf-5542-47fc-89a7-197a1478071f?s=637927089298270000",
    197238: "/resource/thumb/400x300/rt/197238/637927092368065252-8b232601-d551-4558-bb98-7dc8bb602e59?s=637927092378400000",
    197245: "/resource/thumb/400x300/rt/197245/638927085193399322-9979d469-6637-4b19-af17-e343ed77b41f?s=638927085195870000",
    197248: "/resource/thumb/400x300/rt/197248/638151932924200669-e3206768-fbce-4d89-a871-d6a1eda91862?s=638151932935670000",
    197252: "/resource/thumb/400x300/rt/197252/638218661704522321-11d2d63b-2949-47b2-9d95-356d47d6a3cd?s=638218661716730000",
    197293: "/resource/thumb/400x300/rt/197293/638953403579142490-62637dbe-66e0-4b23-885c-3ec0dcc3eca1?s=638953403582300000",
    197296: "/resource/thumb/400x300/rt/197296/638237587542615111-8cddf672-2263-4440-ab12-ce409d9ff887?s=638237587544370000",
    202679: "/resource/thumb/400x300/rt/202679/637968510881507937-435b7c03-e910-42bc-bc4b-13ab2c537df7?s=637968510883070000",
    202793: "/resource/thumb/400x300/rt/202793/638029824826586453-dbf57c15-ce3a-4120-af78-9e65fa0dfb24?s=638029824829800000",
    202794: "/resource/thumb/400x300/rt/202794/638029826179824255-235065dc-dc9f-45e2-8553-9d119447b8ab?s=638029826182300000",
    207236: "/resource/thumb/400x300/rt/207236/638010341308795032-3f3c135b-f449-4ed0-a87e-e5dd87f83341?s=638010341312170000",
    210257: "/resource/thumb/400x300/rt/210257/638052482235046958-c352cd3f-ff20-43f6-b18f-ab800a29d0d7?s=638052482238100000",
    214703: "/resource/thumb/400x300/rt/214703/638063916434081505-7173e3e0-a32f-44ea-83e5-6ef8e0c79711?s=638063916445930000",
    231136: "/resource/thumb/400x300/rt/231136/638410231355223250-161fad3c-1a3b-4f4f-b025-41f9a9019a8b?s=638410231362900000",
    231741: "/resource/thumb/400x300/rt/231741/638205735093776664-076b93ab-3d53-47d6-9c7e-496cce1ae772?s=638205735097070000",
    232126: "/resource/thumb/400x300/rt/232126/638941598467638659-d02f9934-e826-476e-af9a-b79269b74225?s=638941598469430000",
    232642: "/resource/thumb/400x300/rt/232642/638398192859418552-c97309aa-4d2d-431a-870b-2ca9976783e8?s=638398192861130000",
    236426: "/resource/thumb/400x300/rt/236426/638362736299824966-ff5c6d9e-98f0-4196-9be8-eee171577c14?s=638362736312570000",
    240184: "/resource/thumb/400x300/rt/240184/638273871061854441-bdfcb354-ec1b-46b1-9f9a-cd845470d5d4?s=638273871065330000",
    240902: "/resource/thumb/400x300/rt/240902/638273708005595744-f95eee1d-9c43-4990-868d-d3dd640a6939?s=638273708009400000",
    243661: "/resource/thumb/400x300/rt/243661/638410172260252338-9af6e902-4bdd-4dce-bd84-f0288c471ed6?s=638410172267630000",
    243663: "/resource/thumb/400x300/rt/243663/638914876335228306-57b7356c-1181-4483-97bd-7ca7f8028228?s=638914876339430000",
    243664: "/resource/thumb/400x300/rt/243664/638785074498027698-d835a557-c8f3-4256-9de7-af5b6e72d993?s=638785074503030000",
    244975: "/resource/thumb/400x300/rt/244975/638402388851145985-a73b340e-5a34-483c-9ed8-a4db299f1f07?s=638402388859170000",
    252290: "/resource/thumb/400x300/rt/252290/639021079652605107-4ff1ecc5-d4f0-4fc8-9622-2a47be3e89ed?s=639021079661130000",
    253920: "/resource/thumb/400x300/rt/253920/638387845958878717-7bfa1069-5776-4d51-a39a-7cf6234e67aa?s=638387845961700000",
    254553: "/resource/thumb/400x300/rt/254553/638368463652293372-eb724aa7-df04-4311-9ffa-f9656f7d89d2?s=638368463664430000",
    260387: "/resource/thumb/400x300/rt/260387/638406387998525326-3f70d4ee-1f14-426b-b42c-d6da219c4138?s=638406388005830000",
    265572: "/resource/thumb/400x300/rt/265572/638971682615778174-3ed96d0d-73af-459e-86b6-bc33d2183f97?s=638971682618170000",
    269885: "/resource/thumb/400x300/rt/269885/638711426535500829-664dbf2b-59fa-4fb8-ae2b-39bf907a7719?s=638711426542400000",
    278660: "/resource/thumb/400x300/rt/278660/638817047790412533-b6cf3a38-020d-4d83-a664-ce207db0d879?s=638817047804170000",
    282876: "/resource/thumb/400x300/rt/282876/639017666990622576-443cf30e-2112-4ef6-8d99-a75c0b57b99e?s=639017667002230000",
    284397: "/resource/thumb/400x300/rt/284397/638564971250357453-a2176826-1bf2-476c-a949-816dcbac35eb?s=638564971264330000",
    284398: "/resource/thumb/400x300/rt/284398/638539655635476337-ae1565c4-30d2-45bc-a5c4-3a81e29366f4?s=638539655644870000",
    290777: "/resource/thumb/400x300/rt/290777/639094232447084412-57640a1b-802a-43da-92f3-fb3449a2c5f7?s=639094232450730000",
    296108: "/resource/thumb/400x300/rt/296108/638628042643651648-a177424b-c89d-4adf-9ada-754d278725b4?s=638628042649530000",
    296777: "/resource/thumb/400x300/rt/296777/639103257297415641-9358c720-dc55-4b36-a6ee-da3532599bd7?s=639103257300230000",
    296789: "/resource/thumb/400x300/rt/296789/638639080773695625-9d3e033b-e147-4d4b-adb4-7660bfbc62b9?s=638639080785270000",
    305823: "/resource/thumb/400x300/rt/305823/638731300860931931-7a57f886-c2ad-4032-a6a4-dc4b77210613?s=638731300866400000",
    314301: "/resource/thumb/400x300/rt/314301/638972624940182697-1d4194de-7eeb-4338-8ae6-792a6f881cad?s=638972624941870000",
    314789: "/resource/thumb/400x300/rt/314789/638699650514832248-693aac2d-5b3e-46f2-ac65-302b74dcaa8a?s=638699650521870000",
    317581: "/resource/thumb/400x300/rt/317581/638719409323222571-91fe50ae-a3d4-48ef-8f30-726328669c46?s=638719409332300000",
    318487: "/resource/thumb/400x300/rt/318487/639071017134458731-bcd1afc2-c4a1-4c26-9449-63f453573b86?s=639071017137230000",
    318731: "/resource/thumb/400x300/rt/318731/638780146432823642-8ea984f8-5019-463a-8ae4-4534b1267a15?s=638780146441130000",
    323726: "/resource/thumb/400x300/rt/323726/638745489630349533-ed60e926-f4ed-4330-bbda-ab846220356c?s=638745489635970000",
    326999: "/resource/thumb/400x300/rt/326999/638754937105152306-dcfc32a0-29f7-48ad-9eb5-44e4dff8222f?s=638754937111700000",
    327824: "/resource/thumb/400x300/rt/327824/638758237998203966-012d3709-e69d-48af-b960-331a55f4fa72?s=638758238003530000",
    329717: "/resource/thumb/400x300/rt/329717/638812768195332375-5ee6c6ce-88ee-4bf7-b050-eafbc49a9316?s=638812768209430000",
    331583: "/resource/thumb/400x300/rt/331583/638778047167019887-2718ef1c-3bc8-4354-98b2-76c91e79982f?s=638778047169830000",
    333561: "/resource/thumb/400x300/rt/333561/638786896506728022-9e06d004-58be-4e64-b7dd-7b634c62420d?s=638786896515500000",
    336824: "/resource/thumb/400x300/rt/336824/638798045105035879-ce11bb8e-e549-4d77-a089-e4c1ed530c07?s=638798045117700000",
    338291: "/resource/thumb/400x300/rt/338291/639023459536119931-b29ccdf7-eca3-4dac-860f-5e394f53fcd6?s=639023459547300000",
    343052: "/resource/thumb/400x300/rt/343052/638903326275519140-b43d9ddd-bbb9-42d6-9e20-26dc7a775126?s=638903326283600000",
    346130: "/resource/thumb/400x300/rt/346130/638925105568842433-e1d0ed12-d61b-44de-bf63-b5220ba84afd?s=638925105577370000",
    347287: "/resource/thumb/400x300/rt/347287/638850654266892451-6c1eb5d9-bebf-4829-984d-ff48bb4d59e2?s=638850654271900000",
    347289: "/resource/thumb/400x300/rt/347289/639066928650710256-b5e58cbd-2206-419a-8e82-27b1b95b98c9?s=639066928657200000",
    347443: "/resource/thumb/400x300/rt/347443/638850813831948032-a65ea626-61d0-4b80-a7b0-de64fe221707?s=638850813843370000",
    348762: "/resource/thumb/400x300/rt/348762/638857877101690567-df15ebfe-6975-439a-a992-8e7d7635d4cf?s=638857877103870000",
    353068: "/resource/thumb/400x300/rt/353068/638917953912702524-5e1e26c1-3d90-4aaa-9011-e74c2be79fca?s=638917953919200000",
    354206: "/resource/thumb/400x300/rt/354206/638908708548768024-4db02152-7646-4816-802a-9daa7d5f6961?s=638908708557730000",
    355343: "/resource/thumb/400x300/rt/355343/638937498067382144-28351983-125f-49a8-b667-990be55c964b?s=638937498078370000",
    355344: "/resource/thumb/400x300/rt/355344/638925044752960947-188eee39-5712-4e41-b0db-c19d4641fdd5?s=638925044758730000",
    356858: "/resource/thumb/400x300/rt/356858/638932912885386999-fafb71a7-79af-47a8-b783-7cf57f934911?s=638932912891500000",
    376860: "/resource/thumb/400x300/rt/376860/639027197304905251-f55b0d39-7db9-4c2a-a6b1-7f26d763e05c?s=639027197307930000",
    377348: "/resource/thumb/400x300/rt/377348/639032316900542301-0a7c00d8-4a49-4e93-b220-700e9967fc39?s=639032316904230000",
    381085: "/resource/thumb/400x300/rt/381085/639059682991611985-5e0c392b-c174-41ee-96ce-42706dc0f2a6?s=639059682994600000",
    381086: "/resource/thumb/400x300/rt/381086/639059683145548490-2d18365f-a22f-4467-87ca-d88dcd409baa?s=639059683148430000",
    381488: "/resource/thumb/400x300/rt/381488/639068376564385946-af1abec4-4589-41fd-844a-b8158753921e?s=639068376569630000",
    393120: "/resource/thumb/400x300/rt/393120/639105627122400532-d1dd5f07-42a1-4a4b-915b-cc7fad0c6b96?s=639105627125470000"
  };

  var B = [
    {
      n: "ЖК Паруса",
      a: "Малыгина 90",
      lt: 57.134915,
      ln: 65.5634842,
      r: [
        {id: 197232, nm: "Паруса 444 • 11 этаж", sq: 29, g: 2},
        {id: 197214, nm: "Паруса 296", sq: 29, g: 2},
        {id: 197149, nm: "Паруса 294", sq: 29, g: 2},
        {id: 207236, nm: "Паруса 422", sq: 29, g: 2},
        {id: 197238, nm: "Паруса 462", sq: 29, g: 2},
        {id: 231741, nm: "Паруса 532", sq: 29, g: 2},
        {id: 197165, nm: "Паруса 346-А", sq: 29, g: 2},
        {id: 197169, nm: "Паруса 346-Б", sq: 29, g: 2},
        {id: 197173, nm: "Паруса 640", sq: 29, g: 2},
        {id: 197222, nm: "Паруса 346-В", sq: 29, g: 2},
        {id: 197245, nm: "Паруса 570", sq: 29, g: 2},
        {id: 240902, nm: "Паруса 270-А", sq: 29, g: 2},
        {id: 197179, nm: "Паруса 247", sq: 29, g: 2},
        {id: 197200, nm: "Паруса 252", sq: 29, g: 2},
        {id: 202793, nm: "Паруса 492А • PRESIDENT", sq: 58, g: 4},
        {id: 202794, nm: "Паруса 492Б • PRESIDENT", sq: 58, g: 4},
        {id: 197248, nm: "Паруса 624", sq: 29, g: 2},
        {id: 197227, nm: "Паруса 382", sq: 29, g: 2},
        {id: 197163, nm: "Паруса 386 • 4К проектор", sq: 29, g: 2},
        {id: 197160, nm: "Паруса 299", sq: 29, g: 2},
        {id: 197221, nm: "Паруса 341", sq: 29, g: 2},
        {id: 232126, nm: "Паруса 581 • 13 этаж", sq: 29, g: 2},
        {id: 197151, nm: "Паруса 297-А • NEON VICE", sq: 29, g: 2},
        {id: 231136, nm: "Паруса 297-Б • NEON ICON", sq: 29, g: 2},
        {id: 197139, nm: "Паруса 183 • ERROR", sq: 29, g: 2},
        {id: 318487, nm: "Паруса 288-А • PRESIDENT", sq: 58, g: 4},
        {id: 323726, nm: "Паруса 288-Б • PRESIDENT • 4К", sq: 58, g: 4},
        {id: 326999, nm: "Паруса 282", sq: 29, g: 2},
        {id: 296108, nm: "Паруса 493", sq: 29, g: 2},
        {id: 197208, nm: "Паруса 270", sq: 29, g: 2},
        {id: 202679, nm: "Паруса 290 • Лаванда", sq: 29, g: 2},
        {id: 197152, nm: "Паруса 298-1 • Пульс", sq: 29, g: 2},
        {id: 197156, nm: "Паруса 298-2 • Панорама", sq: 29, g: 2}
      ]
    },
    {
      n: "Минская 69",
      a: "Минская 69к1",
      lt: 57.1427282,
      ln: 65.5692615,
      r: [
        {id: 393120, nm: "Минская 69 • Центр города", sq: 70, g: 2}
      ]
    },
    {
      n: "ЖК Корней",
      a: "Эльвиры Федоровой 1",
      lt: 57.1107591,
      ln: 65.5389545,
      r: [
        {id: 377348, nm: "Корнеич • 18 этаж", sq: 29, g: 2}
      ]
    },
    {
      n: "Менделеева 16",
      a: "Дм. Менделеева 16",
      lt: 57.1105161,
      ln: 65.5601371,
      r: [
        {id: 388166, nm: "Менделеева 16-133 • ТРЦ Дарина", sq: 70, g: 2}
      ]
    },
    {
      n: "ЖК Кристалл",
      a: "Менделеева 2",
      lt: 57.1148974,
      ln: 65.5476286,
      r: [
        {id: 327824, nm: "ЖК Кристалл • 14 этаж", sq: 29, g: 2}
      ]
    },
    {
      n: "ЖК Салют",
      a: "Заречная Луговая",
      lt: 57.1778226,
      ln: 65.5603189,
      r: [
        {id: 387524, nm: "SALUT 15 • Приватность", sq: 40, g: 2},
        {id: 386239, nm: "SALUT 101 • Вид на мост", sq: 40, g: 2},
        {id: 254553, nm: "Заречный проезд 2/5", sq: 29, g: 2}
      ]
    },
    {
      n: "50 лет Октября 63Г",
      a: "50 лет Октября 63Г",
      lt: 57.1387068,
      ln: 65.5969903,
      r: [
        {id: 305823, nm: "Сердце Сибири • кв 430", sq: 29, g: 2},
        {id: 278660, nm: "Сердце Сибири • кв 322", sq: 29, g: 2}
      ]
    },
    {
      n: "Тихий проезд 6",
      a: "Тихий проезд 6",
      lt: 57.1692228,
      ln: 65.5615165,
      r: [
        {id: 347289, nm: "Lounge Aurum 316 • 7 этаж", sq: 29, g: 2}
      ]
    },
    {
      n: "ЖК Ария",
      a: "Кармацкого / Молодежная",
      lt: 57.16842,
      ln: 65.5705318,
      r: [
        {id: 376860, nm: "ЖК Ария 51-Б • 9 этаж", sq: 29, g: 2}
      ]
    },
    {
      n: "ЖК Симпл",
      a: "Республики 204",
      lt: 57.1203972,
      ln: 65.6007701,
      r: [
        {id: 333561, nm: "SimplDimple 27 • к7", sq: 29, g: 2},
        {id: 290777, nm: "Симпл 129 • к3", sq: 29, g: 2},
        {id: 284397, nm: "Симпл 114-А • к11", sq: 20, g: 2},
        {id: 284398, nm: "Симпл 114-Б • к11", sq: 20, g: 2}
      ]
    },
    {
      n: "ЖК Колумб",
      a: "Первооткрывателей 8-10",
      lt: 57.1300746,
      ln: 65.4729208,
      r: [
        {id: 354206, nm: "Первооткр. 8-308", sq: 29, g: 2},
        {id: 346130, nm: "Колумб 692 • Перв.10", sq: 29, g: 2},
        {id: 336824, nm: "Колумб • 3 этаж", sq: 29, g: 2}
      ]
    },
    {
      n: "Николая Федорова 17",
      a: "Ник. Федорова 17к3",
      lt: 57.1148858,
      ln: 65.5590298,
      r: [
        {id: 240184, nm: "Ник. Федорова 17к3 • 5 этаж", sq: 29, g: 2}
      ]
    },
    {
      n: "ЖК Айвазовский",
      a: "Пожарных и спасателей",
      lt: 57.1664394,
      ln: 65.5972802,
      r: [
        {id: 260387, nm: "Айвазовский 900", sq: 24, g: 2},
        {id: 296777, nm: "Айвазовский 268А", sq: 24, g: 2},
        {id: 296789, nm: "Айвазовский 268Б", sq: 24, g: 2},
        {id: 343052, nm: "Айвазовский 596А", sq: 24, g: 2},
        {id: 329717, nm: "AIVA 281 • 24 этаж • вид на реку", sq: 24, g: 2},
        {id: 348762, nm: "Айвазовский 260 • Romantic Luxe", sq: 24, g: 2}
      ]
    },
    {
      n: "Орловская 58",
      a: "Орловская 58",
      lt: 57.1509543,
      ln: 65.52499,
      r: [
        {id: 265572, nm: "Орловская 58 кв.3 • 3 этаж", sq: 29, g: 2},
        {id: 197138, nm: "Орловская 58 кв.93 • 17 этаж", sq: 29, g: 2},
        {id: 214703, nm: "Орловская 58 кв.105 • 19 этаж", sq: 29, g: 2}
      ]
    },
    {
      n: "Малыгина 50",
      a: "Малыгина 50",
      lt: 57.1416509,
      ln: 65.5519007,
      r: [
        {id: 243661, nm: "Secret Castle 8 • 3 этаж", sq: 29, g: 2}
      ]
    },
    {
      n: "Харьковская 76",
      a: "Харьковская 76",
      lt: 57.1370269,
      ln: 65.6026339,
      r: [
        {id: 236426, nm: "Харьк.76 кв.19 • 3 этаж", sq: 29, g: 2},
        {id: 282876, nm: "Харьк.76 кв.224", sq: 29, g: 2},
        {id: 253920, nm: "Харьк.76 кв.223", sq: 29, g: 2},
        {id: 318731, nm: "LUXE-76 • Джакузи, Терраса, 4К", sq: 45, g: 2}
      ]
    },
    {
      n: "Харьковская 72А",
      a: "Харьковская 72А",
      lt: 57.1401848,
      ln: 65.5989205,
      r: [
        {id: 338291, nm: "Харьковская 72А-357", sq: 29, g: 2}
      ]
    },
    {
      n: "Монтажников 36",
      a: "Монтажников 36",
      lt: 57.0927911,
      ln: 65.5770917,
      r: [
        {id: 353068, nm: "Монтажников 36", sq: 29, g: 2}
      ]
    },
    {
      n: "Новгородская 22",
      a: "Новгородская 22",
      lt: 57.1575278,
      ln: 65.586982,
      r: [
        {id: 355343, nm: "Новгородская 22-42а", sq: 29, g: 2},
        {id: 355344, nm: "Новгородская 22-42Б", sq: 29, g: 2}
      ]
    },
    {
      n: "ЖК Новин",
      a: "50 лет Октября 57Б",
      lt: 57.1423742,
      ln: 65.5933163,
      r: [
        {id: 252290, nm: "Новин 234", sq: 29, g: 2}
      ]
    },
    {
      n: "Я Волна",
      a: "Верхнеборская",
      lt: 57.167,
      ln: 65.643,
      r: [
        {id: 347443, nm: "Я ВОЛНА • горячий источник", sq: 29, g: 2}
      ]
    },
    {
      n: "Гномбург",
      a: "д.Якуши",
      lt: 57.1298,
      ln: 66.0269,
      r: [
        {id: 317581, nm: "База отдыха Гномбург • Баня и Чан", sq: 80, g: 6}
      ]
    },
    {
      n: "Газовиков 36",
      a: "Газовиков 36",
      lt: 57.1700455,
      ln: 65.5544055,
      r: [
        {id: 244975, nm: "Газовиков 36 • 8 этаж", sq: 29, g: 2}
      ]
    },
    {
      n: "Газовиков 55",
      a: "Газовиков 55к2",
      lt: 57.174064,
      ln: 65.5674066,
      r: [
        {id: 347287, nm: "Газовиков 55 к2-116", sq: 29, g: 2}
      ]
    },
    {
      n: "Суходольская 12",
      a: "Суходольская 12",
      lt: 57.1078757,
      ln: 65.581997,
      r: [
        {id: 197252, nm: "Суходольская 12 • 3 этаж", sq: 29, g: 2}
      ]
    },
    {
      n: "Малыгина 623",
      a: "Малыгина (area Памяти)",
      lt: 57.137,
      ln: 65.558,
      r: [
        {id: 383693, nm: "623 • 19 этаж • вид на площадь Памяти", sq: 29, g: 2}
      ]
    }
  ];

  // ============= CSS =============
  var css = `
    #goshCatalog {
      background: #0a0a0a !important;
      color: #ffffff !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif !important;
      padding: 24px 0 !important;
      box-sizing: border-box !important;
      position: relative !important;
      z-index: 50 !important;
      width: 100% !important;
      overflow: hidden !important;
      margin: 0 !important;
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
      min-height: 400px !important;
    }

    #goshCatalog * {
      box-sizing: border-box !important;
    }

    .gosh-catalog-header {
      padding: 0 24px 24px !important;
      text-align: center !important;
      background: transparent !important;
    }

    .gosh-catalog-header h2 {
      font-size: 28px !important;
      font-weight: 700 !important;
      margin: 0 0 8px 0 !important;
      letter-spacing: -0.5px !important;
      color: #ffffff !important;
      background: transparent !important;
    }

    .gosh-catalog-header p {
      font-size: 14px !important;
      color: #a0a0a0 !important;
      margin: 0 !important;
      font-weight: 400 !important;
      background: transparent !important;
    }

    .gosh-carousel-container {
      position: relative;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    .gosh-carousel-track {
      display: flex;
      gap: 16px;
      padding: 0 24px;
      overflow-x: auto;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .gosh-carousel-track::-webkit-scrollbar {
      display: none;
    }

    .gosh-building-card {
      flex: 0 0 calc(100% - 48px);
      scroll-snap-align: start;
      background: linear-gradient(135deg, rgba(30, 30, 35, 0.8), rgba(20, 20, 25, 0.8));
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .gosh-building-card:hover {
      border-color: rgba(212, 175, 55, 0.6);
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(212, 175, 55, 0.15);
    }

    .gosh-building-card-image {
      width: 100%;
      height: 280px;
      background: linear-gradient(135deg, #1a1a1f, #2a2a2f);
      overflow: hidden;
      position: relative;
    }

    .gosh-building-card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .gosh-building-card:hover .gosh-building-card-image img {
      transform: scale(1.05);
    }

    .gosh-building-card-image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #212126, #1a1a1f);
      color: #666;
      font-size: 12px;
    }

    .gosh-building-card-content {
      padding: 20px;
    }

    .gosh-building-card-name {
      font-size: 20px !important;
      font-weight: 700 !important;
      color: #d4af37 !important;
      margin: 0 0 6px 0 !important;
      letter-spacing: -0.3px !important;
      background: transparent !important;
    }

    .gosh-building-card-address {
      font-size: 13px !important;
      color: #b0b0b0 !important;
      margin: 0 0 12px 0 !important;
      font-weight: 500 !important;
      background: transparent !important;
    }

    .gosh-building-card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #888;
    }

    .gosh-building-card-count {
      font-weight: 600;
      color: #d4af37;
    }

    .gosh-building-card-price {
      font-weight: 600;
      color: #a0a0a0;
      font-size: 13px;
    }

    .gosh-expanded-section {
      display: none;
      background: rgba(15, 15, 20, 0.6);
      border-top: 1px solid rgba(212, 175, 55, 0.2);
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease, padding 0.4s ease;
      backdrop-filter: blur(10px);
    }

    .gosh-expanded-section.active {
      display: block;
      max-height: 1200px;
      padding: 24px;
    }

    .gosh-rooms-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin: 0;
    }

    @media (min-width: 640px) {
      .gosh-carousel-track {
        padding: 0 16px;
      }

      .gosh-building-card {
        flex: 0 0 calc(50% - 8px);
      }

      .gosh-rooms-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .gosh-carousel-track {
        padding: 0 24px;
      }

      .gosh-building-card {
        flex: 0 0 calc(33.333% - 11px);
      }

      .gosh-rooms-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .gosh-room-card {
      background: linear-gradient(135deg, rgba(40, 40, 45, 0.8), rgba(30, 30, 35, 0.8));
      border: 1px solid rgba(212, 175, 55, 0.15);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .gosh-room-card:hover {
      border-color: rgba(212, 175, 55, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.1);
    }

    .gosh-room-image-container {
      position: relative;
      width: 100%;
      height: 200px;
      background: linear-gradient(135deg, #1a1a1f, #2a2a2f);
      overflow: hidden;
    }

    .gosh-room-image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .gosh-room-card:hover .gosh-room-image-container img {
      transform: scale(1.08);
    }

    .gosh-room-image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #212126, #1a1a1f);
      color: #666;
      font-size: 11px;
    }

    .gosh-room-nav {
      position: absolute;
      top: 50%;
      width: 100%;
      transform: translateY(-50%);
      display: flex;
      justify-content: space-between;
      padding: 0 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .gosh-room-card:hover .gosh-room-nav {
      opacity: 1;
    }

    .gosh-room-nav-btn {
      background: rgba(212, 175, 55, 0.8);
      border: none;
      color: #0a0a0a;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .gosh-room-nav-btn:hover {
      background: #d4af37;
      transform: scale(1.1);
    }

    .gosh-room-content {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .gosh-room-name {
      font-size: 15px !important;
      font-weight: 700 !important;
      color: #ffffff !important;
      margin: 0 0 8px 0 !important;
      line-height: 1.3 !important;
      background: transparent !important;
    }

    .gosh-room-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #a0a0a0;
      margin: 0 0 12px 0;
    }

    .gosh-room-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .gosh-room-booking {
      margin-top: auto;
    }

    .gosh-room-btn {
      width: 100%;
      padding: 12px 16px;
      background: linear-gradient(135deg, #d4af37, #e6c946);
      border: none;
      border-radius: 8px;
      color: #0a0a0a;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: block;
      text-align: center;
    }

    .gosh-room-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
      background: linear-gradient(135deg, #e6c946, #d4af37);
    }

    .gosh-room-btn:active {
      transform: translateY(0);
    }

    .gosh-carousel-nav {
      position: absolute;
      top: 50%;
      width: 100%;
      transform: translateY(-50%);
      display: flex;
      justify-content: space-between;
      padding: 0 12px;
      pointer-events: none;
      z-index: 10;
    }

    .gosh-carousel-nav button {
      pointer-events: all;
      background: rgba(212, 175, 55, 0.7);
      border: none;
      color: #0a0a0a;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .gosh-carousel-nav button:hover {
      background: #d4af37;
      transform: scale(1.1);
    }

    .gosh-carousel-nav button:active {
      transform: scale(0.95);
    }

    .gosh-close-expanded {
      display: none;
      background: none;
      border: none;
      color: #d4af37;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      margin: 0 0 16px 0;
      transition: all 0.2s ease;
    }

    .gosh-expanded-section.active .gosh-close-expanded {
      display: block;
    }

    .gosh-close-expanded:hover {
      color: #ffffff;
      transform: rotate(90deg);
    }

    .gosh-expanded-title {
      font-size: 20px !important;
      font-weight: 700 !important;
      color: #d4af37 !important;
      margin: 0 0 20px 0 !important;
      padding: 0 0 12px 0 !important;
      border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
      background: transparent !important;
    }
  `;

  // ============= STATE =============
  var state = {
    expandedBuilding: null,
    roomPhotoIndex: {}
  };

  // ============= HELPER FUNCTIONS =============
  function getFirstRoomPhoto(building) {
    if (building.r && building.r.length > 0) {
      var roomId = building.r[0].id;
      return photos[roomId] ? PH + photos[roomId] : null;
    }
    return null;
  }

  function formatPrice(building) {
    return 'от 1900₽/сутки';
  }

  // ============= RENDER FUNCTIONS =============
  function renderBuildingCard(building, index) {
    var photoUrl = getFirstRoomPhoto(building);
    var photoHtml = photoUrl
      ? '<img src="' + photoUrl + '" alt="' + building.n + '" loading="lazy" />'
      : '<div class="gosh-building-card-image-placeholder">Фото загружается...</div>';

    var roomCount = building.r ? building.r.length : 0;
    var roomText = roomCount === 1 ? 'квартира' :
                   roomCount >= 2 && roomCount <= 4 ? 'квартиры' : 'квартир';

    var html = '<div class="gosh-building-card" data-building-index="' + index + '">' +
      '<div class="gosh-building-card-image">' + photoHtml + '</div>' +
      '<div class="gosh-building-card-content">' +
        '<h3 class="gosh-building-card-name">' + building.n + '</h3>' +
        '<p class="gosh-building-card-address">' + building.a + '</p>' +
        '<div class="gosh-building-card-meta">' +
          '<span class="gosh-building-card-count">' + roomCount + ' ' + roomText + '</span>' +
          '<span class="gosh-building-card-price">' + formatPrice(building) + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';

    return html;
  }

  function renderRoomCard(room) {
    var photoUrl = photos[room.id] ? PH + photos[room.id] : null;
    var photoHtml = photoUrl
      ? '<img src="' + photoUrl + '" alt="' + room.nm + '" loading="lazy" />'
      : '<div class="gosh-room-image-placeholder">Фото загружается...</div>';

    var html = '<div class="gosh-room-card">' +
      '<div class="gosh-room-image-container">' +
        photoHtml +
        '<div class="gosh-room-nav">' +
          '<button class="gosh-room-nav-btn" data-room-id="' + room.id + '" data-nav="prev" style="display:none;">❮</button>' +
          '<button class="gosh-room-nav-btn" data-room-id="' + room.id + '" data-nav="next" style="display:none;">❯</button>' +
        '</div>' +
      '</div>' +
      '<div class="gosh-room-content">' +
        '<h4 class="gosh-room-name">' + room.nm + '</h4>' +
        '<div class="gosh-room-meta">' +
          '<span>📐 ' + room.sq + ' м²</span>' +
          '<span>👥 до ' + room.g + '</span>' +
        '</div>' +
        '<div class="gosh-room-booking">' +
          '<a href="' + BK + room.id + '" class="gosh-room-btn">Забронировать</a>' +
        '</div>' +
      '</div>' +
    '</div>';

    return html;
  }

  function renderExpandedSection(building) {
    var roomCount = building.r ? building.r.length : 0;
    var html = '<div class="gosh-expanded-section" data-building-index="' + B.indexOf(building) + '">' +
      '<button class="gosh-close-expanded">✕</button>' +
      '<h3 class="gosh-expanded-title">' + building.n + ' (' + roomCount + ' квартир)</h3>' +
      '<div class="gosh-rooms-grid">';

    if (building.r) {
      for (var i = 0; i < building.r.length; i++) {
        html += renderRoomCard(building.r[i]);
      }
    }

    html += '</div></div>';
    return html;
  }

  // ============= EVENT HANDLERS =============
  function handleBuildingCardClick(e) {
    var card = e.currentTarget;
    var buildingIndex = parseInt(card.getAttribute('data-building-index'), 10);
    var building = B[buildingIndex];

    var container = document.getElementById('goshCatalog');
    var existingExpanded = container.querySelector('.gosh-expanded-section.active');

    if (existingExpanded) {
      existingExpanded.classList.remove('active');
      setTimeout(function() {
        existingExpanded.remove();
      }, 400);
    }

    state.expandedBuilding = buildingIndex;

    var expandedHtml = renderExpandedSection(building);
    card.insertAdjacentHTML('afterend', expandedHtml);

    setTimeout(function() {
      var expanded = container.querySelector('[data-building-index="' + buildingIndex + '"].gosh-expanded-section');
      if (expanded) {
        expanded.classList.add('active');
      }
    }, 10);
  }

  function handleCloseExpanded(e) {
    var section = e.target.closest('.gosh-expanded-section');
    if (section) {
      section.classList.remove('active');
      setTimeout(function() {
        section.remove();
        state.expandedBuilding = null;
      }, 400);
    }
  }

  function handleCarouselNav(e) {
    var btn = e.target.closest('.gosh-carousel-nav button');
    if (!btn) return;

    var direction = btn.getAttribute('data-direction');
    var track = document.querySelector('.gosh-carousel-track');
    var cardWidth = track.querySelector('.gosh-building-card').offsetWidth + 16;
    var scrollAmount = cardWidth;

    if (direction === 'prev') {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'next') {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  // ============= INIT FUNCTION =============
  function init() {
    var container = document.getElementById('goshCatalog');
    if (!container) {
      container = document.createElement('div');
      container.id = 'goshCatalog';
      document.body.appendChild(container);
    }

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var html = '<div class="gosh-catalog-header">' +
      '<h2>Выберите квартиру</h2>' +
      '<p>Свайпайте карточки и выбирайте подходящий адрес</p>' +
    '</div>' +
    '<div class="gosh-carousel-container">' +
      '<div class="gosh-carousel-track">';

    for (var i = 0; i < B.length; i++) {
      html += renderBuildingCard(B[i], i);
    }

    html += '</div>' +
      '<div class="gosh-carousel-nav">' +
        '<button data-direction="prev">❮</button>' +
        '<button data-direction="next">❯</button>' +
      '</div>' +
    '</div>';

    container.innerHTML = html;

    // Attach event listeners
    var buildingCards = container.querySelectorAll('.gosh-building-card');
    for (var i = 0; i < buildingCards.length; i++) {
      buildingCards[i].addEventListener('click', handleBuildingCardClick);
    }

    var navButtons = container.querySelectorAll('.gosh-carousel-nav button');
    for (var i = 0; i < navButtons.length; i++) {
      navButtons[i].addEventListener('click', handleCarouselNav);
    }

    // Event delegation for close button
    container.addEventListener('click', handleCloseExpanded);
  }

  // ============= AUTO-INIT =============
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
