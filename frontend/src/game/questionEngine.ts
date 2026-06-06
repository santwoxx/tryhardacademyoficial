export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type Subject = 'math' | 'portuguese' | 'science' | 'history' | 'geography';

export interface Question {
    id: string;
    text: string;
    options: any[];
    answer: any;
    explanation: string;
    difficulty: Difficulty;
    subject: Subject;
}

// Massive Static Question Banks
const QUESTION_BANKS: Record<Exclude<Subject, 'math'>, Record<Difficulty, Omit<Question, 'id' | 'subject' | 'difficulty'>[]>> = {
    portuguese: {
        easy: [
            { text: "Qual o antônimo de 'Bom'?", options: ["Ruim", "Legal", "Feliz", "Triste"], answer: "Ruim", explanation: "O contrário de bom é ruim." },
            { text: "Qual palavra é um substantivo?", options: ["Correr", "Gato", "Lindo", "Rapidamente"], answer: "Gato", explanation: "Gato é o nome de um animal (substantivo)." },
            { text: "Como se separa a sílaba de 'Bolo'?", options: ["Bo-lo", "B-o-lo", "Bol-o", "B-olo"], answer: "Bo-lo", explanation: "Bolo é uma palavra dissílaba: Bo-lo." },
            { text: "Qual o sinônimo de 'Alegre'?", options: ["Feliz", "Triste", "Bravo", "Cansado"], answer: "Feliz", explanation: "Sinônimos são palavras com significados semelhantes." },
            { text: "Qual palavra está no plural?", options: ["Meninos", "Casa", "Cachorro", "Livro"], answer: "Meninos", explanation: "O 's' no final indica mais de um." },
            { text: "Como se escreve o plural de 'Luz'?", options: ["Luzes", "Luzs", "Luz", "Luzeis"], answer: "Luzes", explanation: "Palavras terminadas em Z fazem plural com ES." },
            { text: "Qual palavra é oxítona?", options: ["Café", "Árvore", "Lápis", "Mesa"], answer: "Café", explanation: "Café tem a última sílaba tônica." },
            { text: "O que é um verbo?", options: ["Ação", "Nome", "Característica", "Lugar"], answer: "Ação", explanation: "Verbos indicam ação, estado ou fenômeno." },
            { text: "Qual palavra é proparoxítona?", options: ["Lâmpada", "Mesa", "Café", "Papel"], answer: "Lâmpada", explanation: "Lâmpada tem a antepenúltima sílaba tônica." },
            { text: "Qual é o feminino de 'Cavalo'?", options: ["Égua", "Cavala", "Ovelha", "Vaca"], answer: "Égua", explanation: "O feminino correto de cavalo é égua." }
        ],
        medium: [
            { text: "Qual a classificação da palavra 'Árvore'?", options: ["Oxítona", "Paroxítona", "Proparoxítona", "Monossílaba"], answer: "Proparoxítona", explanation: "A antepenúltima sílaba é tônica." },
            { text: "O que é um adjetivo?", options: ["Nome", "Ação", "Característica", "Lugar"], answer: "Característica", explanation: "Adjetivo dá característica ao substantivo." },
            { text: "Qual o plural de 'Cidadão'?", options: ["Cidadãos", "Cidadões", "Cidadães", "Cidadão"], answer: "Cidadãos", explanation: "A forma correta do plural é cidadãos." },
            { text: "Qual a conjugação de 'Eu canto'?", options: ["Presente", "Pretérito", "Futuro", "Imperativo"], answer: "Presente", explanation: "A ação está acontecendo agora." },
            { text: "O que é um pronome?", options: ["Substitui o nome", "Indica ação", "Dá qualidade", "Liga orações"], answer: "Substitui o nome", explanation: "Pronomes substituem ou acompanham substantivos." },
            { text: "Qual frase tem erro de crase?", options: ["Vou à praia.", "Refiro-me à menina.", "Ando à pé.", "Fui à escola."], answer: "Ando à pé.", explanation: "Não se usa crase antes de palavras masculinas como 'pé'." },
            { text: "Qual é o plural de 'Pão'?", options: ["Pães", "Pãos", "Pões", "Põeses"], answer: "Pães", explanation: "O plural de pão é pães." },
            { text: "O que é um advérbio?", options: ["Modifica o verbo", "Nomeia seres", "Dá característica", "Liga palavras"], answer: "Modifica o verbo", explanation: "Advérbios modificam verbos, adjetivos ou advérbios." },
            { text: "Qual é a figura de linguagem em 'Chorei rios'?", options: ["Hipérbole", "Metáfora", "Eufemismo", "Ironia"], answer: "Hipérbole", explanation: "Hipérbole é o exagero intencional." },
            { text: "Qual é a sílaba tônica de 'Abacaxi'?", options: ["xi", "ca", "ba", "a"], answer: "xi", explanation: "Abacaxi é uma palavra oxítona." }
        ],
        hard: [
            { text: "Em 'Vende-se casas', qual a figura de linguagem?", options: ["Metáfora", "Silepse", "Nenhuma, erro", "Metonímia"], answer: "Nenhuma, erro", explanation: "O correto é 'Vendem-se casas' (Voz passiva sintética)." },
            { text: "O que é Pleonasmo?", options: ["Omissão", "Redundância", "Exagero", "Atenuação"], answer: "Redundância", explanation: "Pleonasmo é o uso de palavras redundantes (ex: subir para cima)." },
            { text: "Qual é o pretérito mais-que-perfeito de 'falar' (eu)?", options: ["Falei", "Falava", "Falara", "Falarei"], answer: "Falara", explanation: "Eu falara é o pretérito mais-que-perfeito." },
            { text: "O que é uma oração coordenada?", options: ["Independente", "Dependente", "Subordinada", "Apenas verbo"], answer: "Independente", explanation: "Orações coordenadas não dependem sintaticamente de outras." },
            { text: "Qual o plural de 'Caráter'?", options: ["Caracteres", "Caráteres", "Caráters", "Carateres"], answer: "Caracteres", explanation: "O plural de caráter é caracteres." },
            { text: "Qual figura há em 'A vida é um palco'?", options: ["Metáfora", "Símile", "Metonímia", "Catacrese"], answer: "Metáfora", explanation: "Comparação implícita." },
            { text: "Qual é o plural de 'Qualquer'?", options: ["Quaisquer", "Qualqueres", "Quaisqueres", "Qualquer"], answer: "Quaisquer", explanation: "A flexão ocorre no meio da palavra." },
            { text: "O que é próclise?", options: ["Pronome antes do verbo", "Pronome depois do verbo", "Pronome no meio do verbo", "Sem pronome"], answer: "Pronome antes do verbo", explanation: "Ex: Não me diga." },
            { text: "O que é mesóclise?", options: ["Pronome no meio", "Pronome antes", "Pronome depois", "Verbo no infinitivo"], answer: "Pronome no meio", explanation: "Ex: Falar-te-ei." },
            { text: "O que é um adjunto adnominal?", options: ["Acompanha o núcleo", "Modifica o verbo", "Liga orações", "Expressa emoção"], answer: "Acompanha o núcleo", explanation: "Acompanha e especifica um substantivo." }
        ],
        extreme: [
            { text: "Qual é a função sintática de 'A ele' em 'Entreguei a ele'?", options: ["Objeto Indireto", "Objeto Direto", "Sujeito", "Adjunto"], answer: "Objeto Indireto", explanation: "Completa o verbo transitivo indireto." },
            { text: "Identifique o zeugma: 'Eu gosto de maçã, ela de pera'.", options: ["Omissão de 'gosta'", "Comparação", "Exagero", "Redundância"], answer: "Omissão de 'gosta'", explanation: "Zeugma é a omissão de um termo já citado." },
            { text: "O que é silepse de gênero?", options: ["Concordância com ideia", "Concordância gramatical", "Erro ortográfico", "Neologismo"], answer: "Concordância com ideia", explanation: "Ex: São Paulo é muito poluída (cidade)." },
            { text: "Qual é o particípio irregular de 'Pegar'?", options: ["Pego", "Pegado", "Peguei", "Pegara"], answer: "Pego", explanation: "Pegado é regular, pego é irregular." },
            { text: "O que é um anacoluto?", options: ["Quebra da estrutura", "Repetição de sons", "Inversão da ordem", "Mistura de sentidos"], answer: "Quebra da estrutura", explanation: "Ex: Eu, parece que vou desmaiar." }
        ]
    },
    science: {
        easy: [
            { text: "O sol é uma:", options: ["Estrela", "Planeta", "Satélite", "Cometa"], answer: "Estrela", explanation: "O Sol é a estrela central." },
            { text: "O que nós respiramos para viver?", options: ["Gás Carbônico", "Nitrogênio", "Oxigênio", "Hélio"], answer: "Oxigênio", explanation: "Seres humanos respiram oxigênio." },
            { text: "Qual animal é mamífero?", options: ["Galinha", "Cachorro", "Sapo", "Cobra"], answer: "Cachorro", explanation: "Cachorros mamam quando filhotes." },
            { text: "A água ferve a quantos graus?", options: ["100°C", "50°C", "0°C", "200°C"], answer: "100°C", explanation: "A água ferve a 100°C ao nível do mar." },
            { text: "Qual planeta tem anéis?", options: ["Saturno", "Marte", "Vênus", "Terra"], answer: "Saturno", explanation: "Saturno é famoso por seus anéis." },
            { text: "Quantos planetas há no sistema solar?", options: ["8", "9", "7", "10"], answer: "8", explanation: "Atualmente, consideramos 8 planetas." },
            { text: "O que a lagarta vira?", options: ["Borboleta", "Mosca", "Aranha", "Besouro"], answer: "Borboleta", explanation: "Ela passa por metamorfose." },
            { text: "A lua é o quê da Terra?", options: ["Satélite Natural", "Planeta", "Estrela", "Cometa"], answer: "Satélite Natural", explanation: "A Lua orbita a Terra." },
            { text: "Qual órgão bombeia sangue?", options: ["Coração", "Pulmão", "Fígado", "Rim"], answer: "Coração", explanation: "O coração bombeia o sangue pelo corpo." },
            { text: "Os peixes respiram por onde?", options: ["Brânquias", "Pulmões", "Pele", "Boca"], answer: "Brânquias", explanation: "Brânquias (ou guelras) filtram oxigênio da água." }
        ],
        medium: [
            { text: "Qual é a fórmula da água?", options: ["H2O", "CO2", "NaCl", "O2"], answer: "H2O", explanation: "Dois átomos de hidrogênio e um de oxigênio." },
            { text: "O que é fotossíntese?", options: ["Plantas fazem energia", "Respiração animal", "Evaporação da água", "Movimento da Terra"], answer: "Plantas fazem energia", explanation: "Plantas convertem luz solar em energia." },
            { text: "Quantos ossos tem o corpo humano adulto?", options: ["206", "300", "150", "250"], answer: "206", explanation: "O corpo adulto tem exatamente 206 ossos." },
            { text: "O que é o núcleo da célula?", options: ["Centro de controle", "Produz energia", "Digere alimentos", "Protege a célula"], answer: "Centro de controle", explanation: "Contém o DNA." },
            { text: "Qual é o maior órgão do corpo humano?", options: ["Pele", "Fígado", "Intestino", "Coração"], answer: "Pele", explanation: "A pele cobre todo o corpo." },
            { text: "Qual gás as plantas absorvem?", options: ["Gás Carbônico", "Oxigênio", "Nitrogênio", "Metano"], answer: "Gás Carbônico", explanation: "Usado na fotossíntese." },
            { text: "O que é a força da gravidade?", options: ["Atração entre massas", "Força magnética", "Força nuclear", "Força elétrica"], answer: "Atração entre massas", explanation: "Puxa os corpos em direção ao centro da Terra." },
            { text: "Qual vitamina o Sol ajuda a produzir?", options: ["Vitamina D", "Vitamina C", "Vitamina A", "Vitamina B"], answer: "Vitamina D", explanation: "Produzida na pele com luz solar." },
            { text: "O que mede o termômetro?", options: ["Temperatura", "Pressão", "Umidade", "Vento"], answer: "Temperatura", explanation: "Mede o grau de agitação das moléculas." },
            { text: "O que é a Via Láctea?", options: ["Nossa galáxia", "Um rio", "Uma constelação", "Um planeta"], answer: "Nossa galáxia", explanation: "A galáxia onde está o Sistema Solar." }
        ],
        hard: [
            { text: "Qual a principal função das mitocôndrias?", options: ["Produção de ATP", "Síntese de proteínas", "Divisão celular", "Digestão intracelular"], answer: "Produção de ATP", explanation: "Usinas de energia da célula." },
            { text: "Qual é a teoria de Albert Einstein?", options: ["Relatividade", "Gravitação Universal", "Evolução", "Leis de Newton"], answer: "Relatividade", explanation: "E = mc² é parte da teoria da relatividade." },
            { text: "O que é um buraco negro?", options: ["Região de gravidade extrema", "Um planeta escuro", "Uma estrela anã", "Nebulosa"], answer: "Região de gravidade extrema", explanation: "Nem a luz escapa." },
            { text: "Qual a velocidade da luz?", options: ["~300.000 km/s", "~150.000 km/s", "~300 km/s", "~3.000 km/s"], answer: "~300.000 km/s", explanation: "A velocidade mais rápida no universo." },
            { text: "O que são isótopos?", options: ["Mesmo nº atômico", "Mesma massa", "Mesmo nº de nêutrons", "Mesmo volume"], answer: "Mesmo nº atômico", explanation: "Diferem no número de nêutrons." },
            { text: "O que é a Lei da Inércia?", options: ["1ª Lei de Newton", "2ª Lei de Newton", "3ª Lei de Newton", "Lei de Kepler"], answer: "1ª Lei de Newton", explanation: "Corpos tendem a manter seu estado." },
            { text: "Qual é o pH neutro?", options: ["7", "0", "14", "10"], answer: "7", explanation: "Abaixo de 7 é ácido, acima é básico." },
            { text: "O que diz a 3ª Lei de Newton?", options: ["Ação e Reação", "Inércia", "Aceleração", "Gravidade"], answer: "Ação e Reação", explanation: "Para toda ação há uma reação igual e oposta." },
            { text: "Qual metal é líquido à temperatura ambiente?", options: ["Mercúrio", "Chumbo", "Ouro", "Ferro"], answer: "Mercúrio", explanation: "Único metal líquido." },
            { text: "O que é a meiose?", options: ["Divisão celular (gametas)", "Multiplicação de vírus", "Morte celular", "Crescimento de tecido"], answer: "Divisão celular (gametas)", explanation: "Reduz os cromossomos pela metade." }
        ],
        extreme: [
            { text: "O que é a radiação Hawking?", options: ["Emissão por buracos negros", "Radiação solar", "Micro-ondas cósmicas", "Fissão nuclear"], answer: "Emissão por buracos negros", explanation: "Teorizada por Stephen Hawking." },
            { text: "Qual partícula transmite a força eletromagnética?", options: ["Fóton", "Glúon", "Bóson W", "Graviton"], answer: "Fóton", explanation: "O fóton é o quantum de luz." },
            { text: "O que é o Princípio da Incerteza?", options: ["Heisenberg", "Einstein", "Bohr", "Schrödinger"], answer: "Heisenberg", explanation: "Não se pode saber posição e momento simultaneamente." },
            { text: "Qual a constante de Planck?", options: ["6.626 × 10^-34 J·s", "3 × 10^8 m/s", "9.8 m/s²", "3.1415"], answer: "6.626 × 10^-34 J·s", explanation: "Fundamental na mecânica quântica." },
            { text: "O que é um Bóson de Higgs?", options: ["Partícula que dá massa", "Um tipo de estrela", "Um fóton pesado", "Uma molécula orgânica"], answer: "Partícula que dá massa", explanation: "A 'Partícula de Deus'." }
        ]
    },
    history: {
        easy: [
            { text: "Quem descobriu o Brasil?", options: ["Pedro Álvares Cabral", "Cristóvão Colombo", "Vasco da Gama", "Dom Pedro I"], answer: "Pedro Álvares Cabral", explanation: "Cabral chegou ao Brasil em 1500." },
            { text: "Em que ano o Brasil foi descoberto?", options: ["1400", "1500", "1822", "1889"], answer: "1500", explanation: "Em 22 de abril de 1500." },
            { text: "Quem libertou os escravos no Brasil?", options: ["Princesa Isabel", "Dom Pedro II", "Tiradentes", "Zumbi"], answer: "Princesa Isabel", explanation: "Assinou a Lei Áurea em 1888." },
            { text: "Quem foi o primeiro presidente do Brasil?", options: ["Deodoro da Fonseca", "Getúlio Vargas", "Dom Pedro I", "Juscelino"], answer: "Deodoro da Fonseca", explanation: "Após a Proclamação da República em 1889." },
            { text: "Que país o Brasil colonizou?", options: ["Nenhum", "Angola", "Uruguai", "Portugal"], answer: "Nenhum", explanation: "O Brasil foi colonizado por Portugal." },
            { text: "Quem gritou 'Independência ou Morte'?", options: ["Dom Pedro I", "Tiradentes", "Cabral", "Princesa Isabel"], answer: "Dom Pedro I", explanation: "No grito do Ipiranga." },
            { text: "Qual a capital do Império Romano?", options: ["Roma", "Atenas", "Egito", "Constantinopla"], answer: "Roma", explanation: "O império se originou lá." },
            { text: "Quem pintou a Mona Lisa?", options: ["Da Vinci", "Picasso", "Van Gogh", "Michelangelo"], answer: "Da Vinci", explanation: "Leonardo da Vinci, no Renascimento." },
            { text: "Onde surgiram as Olimpíadas?", options: ["Grécia", "Roma", "Egito", "Inglaterra"], answer: "Grécia", explanation: "Na Grécia Antiga." },
            { text: "Quem foi Tiradentes?", options: ["Líder da Inconfidência", "Imperador", "Presidente", "Descobridor"], answer: "Líder da Inconfidência", explanation: "Mártir da Inconfidência Mineira." }
        ],
        medium: [
            { text: "De quem o Brasil declarou independência?", options: ["Portugal", "Espanha", "Inglaterra", "França"], answer: "Portugal", explanation: "Até 1822." },
            { text: "Qual o nome da 1ª capital do Brasil?", options: ["Salvador", "Rio de Janeiro", "São Paulo", "Brasília"], answer: "Salvador", explanation: "Foi a capital colonial inicial." },
            { text: "Quando começou a Segunda Guerra Mundial?", options: ["1939", "1914", "1945", "1929"], answer: "1939", explanation: "Com a invasão da Polônia." },
            { text: "Qual foi a última família imperial russa?", options: ["Romanov", "Tudor", "Bourbon", "Habsburgo"], answer: "Romanov", explanation: "Derrubados na Revolução Russa." },
            { text: "Quem foi o líder do Nazismo?", options: ["Hitler", "Mussolini", "Stalin", "Churchill"], answer: "Hitler", explanation: "Na Alemanha." },
            { text: "O que foi o Renascimento?", options: ["Movimento cultural", "Uma guerra", "Uma religião", "Uma peste"], answer: "Movimento cultural", explanation: "Surgiu na Itália (séc XIV)." },
            { text: "Quem construiu Brasília?", options: ["Juscelino Kubitschek", "Getúlio Vargas", "Dutra", "Jânio Quadros"], answer: "Juscelino Kubitschek", explanation: "Inaugurada em 1960." },
            { text: "O que foi a Revolução Francesa?", options: ["Fim da monarquia absolutista", "Guerra mundial", "Revolução Industrial", "Invenção da guilhotina"], answer: "Fim da monarquia absolutista", explanation: "Começou em 1789." },
            { text: "Quem escreveu 'O Manifesto Comunista'?", options: ["Karl Marx", "Lenin", "Stalin", "Trotsky"], answer: "Karl Marx", explanation: "Com Friedrich Engels." },
            { text: "O que marcou o fim da Idade Média?", options: ["Queda de Constantinopla", "Descobrimento da América", "Fim do Império Romano", "Peste Negra"], answer: "Queda de Constantinopla", explanation: "Em 1453." }
        ],
        hard: [
            { text: "Qual presidente brasileiro sofreu impeachment em 1992?", options: ["Collor de Mello", "Dilma Rousseff", "João Goulart", "Sarney"], answer: "Collor de Mello", explanation: "Alvo de impeachment em 1992." },
            { text: "O que foi a Guerra Fria?", options: ["Conflito EUA x URSS", "Guerra de Inverno na Rússia", "Conflito direto", "Guerra Civil Americana"], answer: "Conflito EUA x URSS", explanation: "Disputa política e militar." },
            { text: "Qual foi a última dinastia chinesa?", options: ["Qing", "Ming", "Han", "Tang"], answer: "Qing", explanation: "Até 1912." },
            { text: "Qual o tratado que dividiu o mundo entre Portugal e Espanha?", options: ["Tordesilhas", "Versalhes", "Madri", "Utrecht"], answer: "Tordesilhas", explanation: "Assinado em 1494." },
            { text: "Quem unificou a Alemanha em 1871?", options: ["Bismarck", "Hitler", "Guilherme II", "Metternich"], answer: "Bismarck", explanation: "O 'Chanceler de Ferro'." },
            { text: "O que foi a Revolução Meiji?", options: ["Modernização do Japão", "Revolução na China", "Fim dos Samurais na Coreia", "Guerra Civil Indiana"], answer: "Modernização do Japão", explanation: "Séc XIX." },
            { text: "Qual império foi destruído por Pizarro?", options: ["Inca", "Asteca", "Maia", "Olmeca"], answer: "Inca", explanation: "No Peru." },
            { text: "Quem foi o líder de Cartago nas Guerras Púnicas?", options: ["Aníbal", "Cipião", "Alexandre", "César"], answer: "Aníbal", explanation: "Célebre pelos elefantes." },
            { text: "O que foi a Guerra dos Trinta Anos?", options: ["Conflito religioso na Europa", "Guerra entre Inglaterra e França", "Guerra Civil Espanhola", "Guerra Fria"], answer: "Conflito religioso na Europa", explanation: "1618-1648." },
            { text: "O que foi a Primavera de Praga?", options: ["Tentativa de abertura política (1968)", "Invasão nazista", "Revolução de Veludo", "Fim da URSS"], answer: "Tentativa de abertura política (1968)", explanation: "Na Tchecoslováquia." }
        ],
        extreme: [
            { text: "Quem sucedeu Lenin na URSS?", options: ["Stalin", "Trotsky", "Khrushchev", "Gorbachev"], answer: "Stalin", explanation: "Após a morte de Lenin em 1924." },
            { text: "O que estabeleceu a Paz de Vestfália?", options: ["Sistema de soberania estatal", "Fim da 1ª Guerra", "Início do Império Romano", "Divisão da África"], answer: "Sistema de soberania estatal", explanation: "Em 1648." },
            { text: "Qual faraó tentou implementar o monoteísmo no Egito?", options: ["Akhenaton", "Ramsés II", "Tutancâmon", "Cleópatra"], answer: "Akhenaton", explanation: "Culto a Aton." },
            { text: "Qual a batalha decisiva de Waterloo?", options: ["Derrota de Napoleão (1815)", "Vitória de Napoleão", "Guerra dos Cem Anos", "Guerra das Rosas"], answer: "Derrota de Napoleão (1815)", explanation: "Fim do Império Napoleônico." },
            { text: "O que foi a Revolução de Xinhai?", options: ["Fim do império chinês (1911)", "Comunismo na China", "Invasão mongol", "Rebelião dos Boxers"], answer: "Fim do império chinês (1911)", explanation: "Início da República da China." }
        ]
    },
    geography: {
        easy: [
            { text: "Qual o maior país da América do Sul?", options: ["Brasil", "Argentina", "Chile", "Colômbia"], answer: "Brasil", explanation: "O Brasil tem a maior extensão territorial." },
            { text: "Quantos continentes existem?", options: ["6", "5", "7", "4"], answer: "6", explanation: "América, Europa, África, Ásia, Oceania e Antártida." },
            { text: "O Brasil fica em qual continente?", options: ["América", "Europa", "Ásia", "África"], answer: "América", explanation: "Na América do Sul." },
            { text: "Qual o idioma do Brasil?", options: ["Português", "Espanhol", "Inglês", "Brasileiro"], answer: "Português", explanation: "Idioma oficial." },
            { text: "Qual é a capital do Brasil?", options: ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"], answer: "Brasília", explanation: "Desde 1960." },
            { text: "Qual a capital da França?", options: ["Paris", "Londres", "Roma", "Berlim"], answer: "Paris", explanation: "Cidade da Luz." },
            { text: "Qual o maior país do mundo?", options: ["Rússia", "Canadá", "China", "EUA"], answer: "Rússia", explanation: "Maior extensão." },
            { text: "Qual continente tem mais gelo?", options: ["Antártida", "Europa", "América", "Ásia"], answer: "Antártida", explanation: "Cobre o Pólo Sul." },
            { text: "Qual a capital dos EUA?", options: ["Washington D.C.", "Nova York", "Los Angeles", "Miami"], answer: "Washington D.C.", explanation: "Distrito de Colúmbia." },
            { text: "Qual país tem o formato de uma bota?", options: ["Itália", "Espanha", "Grécia", "Portugal"], answer: "Itália", explanation: "Fácil de ver no mapa." }
        ],
        medium: [
            { text: "Qual o maior oceano do mundo?", options: ["Pacífico", "Atlântico", "Índico", "Ártico"], answer: "Pacífico", explanation: "Cobre mais de um terço da superfície." },
            { text: "Qual a capital da Austrália?", options: ["Camberra", "Sydney", "Melbourne", "Perth"], answer: "Camberra", explanation: "Construída para ser a capital." },
            { text: "Onde fica a Floresta Amazônica na maior parte?", options: ["Brasil", "Peru", "Colômbia", "Venezuela"], answer: "Brasil", explanation: "Cerca de 60%." },
            { text: "Qual é o rio mais longo do mundo?", options: ["Nilo", "Amazonas", "Yangtzé", "Mississippi"], answer: "Nilo", explanation: "(Há debates, mas Nilo é resposta clássica)." },
            { text: "Em que país fica o Monte Fuji?", options: ["Japão", "China", "Coreia do Sul", "Índia"], answer: "Japão", explanation: "Vulcão ícone do Japão." },
            { text: "Qual o menor país do mundo?", options: ["Vaticano", "Mônaco", "San Marino", "Liechtenstein"], answer: "Vaticano", explanation: "Fica dentro de Roma." },
            { text: "Onde ficam as Pirâmides de Gizé?", options: ["Egito", "México", "Peru", "Sudão"], answer: "Egito", explanation: "No norte da África." },
            { text: "Qual a moeda do Japão?", options: ["Iene", "Yuan", "Won", "Baht"], answer: "Iene", explanation: "JPY." },
            { text: "Qual país tem a maior fronteira com o Brasil?", options: ["Bolívia", "Argentina", "Venezuela", "Paraguai"], answer: "Bolívia", explanation: "Mais de 3.400 km." },
            { text: "Qual estrela guiava os navegantes do Hemisfério Sul?", options: ["Cruzeiro do Sul", "Estrela Polar", "Sirius", "Alpha Centauri"], answer: "Cruzeiro do Sul", explanation: "Constelação símbolo." }
        ],
        hard: [
            { text: "Qual é o país mais populoso do mundo (2023+)?", options: ["Índia", "China", "EUA", "Rússia"], answer: "Índia", explanation: "Ultrapassou a China." },
            { text: "Qual é a montanha mais alta do mundo?", options: ["Monte Everest", "K2", "Kilimanjaro", "Aconcágua"], answer: "Monte Everest", explanation: "8.848 metros." },
            { text: "Em qual país fica o Deserto do Saara?", options: ["Norte da África", "Só no Egito", "Só na Argélia", "África do Sul"], answer: "Norte da África", explanation: "Cobre vários países." },
            { text: "Qual a capital da Turquia?", options: ["Ancara", "Istambul", "Atenas", "Damasco"], answer: "Ancara", explanation: "Istambul é a maior cidade, não a capital." },
            { text: "Qual é o rio mais volumoso do mundo?", options: ["Amazonas", "Nilo", "Congo", "Ganges"], answer: "Amazonas", explanation: "Em volume de água." },
            { text: "Quais países formam o chifre da África?", options: ["Somália, Etiópia...", "África do Sul, Namíbia...", "Marrocos, Argélia...", "Nigéria, Níger..."], answer: "Somália, Etiópia...", explanation: "Fica no leste africano." },
            { text: "Qual o lago mais profundo do mundo?", options: ["Baikal", "Vitória", "Superior", "Titicaca"], answer: "Baikal", explanation: "Fica na Rússia." },
            { text: "Onde se localiza o estreito de Gibraltar?", options: ["Espanha e Marrocos", "Itália e Grécia", "França e Inglaterra", "Turquia e Grécia"], answer: "Espanha e Marrocos", explanation: "Liga Atlântico e Mediterrâneo." },
            { text: "Qual país não faz fronteira com o Brasil?", options: ["Equador", "Peru", "Colômbia", "Venezuela"], answer: "Equador", explanation: "Equador e Chile não fazem." },
            { text: "Qual a maior ilha do mundo?", options: ["Groenlândia", "Austrália", "Madagascar", "Nova Guiné"], answer: "Groenlândia", explanation: "Austrália é continente." }
        ],
        extreme: [
            { text: "Qual a capital do Cazaquistão?", options: ["Astana", "Almaty", "Tashkent", "Baku"], answer: "Astana", explanation: "(Recentemente mudou de nome e voltou para Astana)." },
            { text: "Qual o único país sem rios perenes?", options: ["Arábia Saudita", "Mônaco", "Singapura", "Egito"], answer: "Arábia Saudita", explanation: "Não possui rios permanentes." },
            { text: "Que montanhas dividem a Europa da Ásia?", options: ["Urais", "Alpes", "Cáucaso", "Himalaia"], answer: "Urais", explanation: "Montanhas Urais na Rússia." },
            { text: "Qual é a capital de Burkina Faso?", options: ["Ouagadougou", "Dakar", "Bamako", "Niamey"], answer: "Ouagadougou", explanation: "Na África Ocidental." },
            { text: "Qual mar não tem costa terrestre (bordas)?", options: ["Mar dos Sargaços", "Mar Morto", "Mar Vermelho", "Mar Negro"], answer: "Mar dos Sargaços", explanation: "Delimitado por correntes oceânicas no Atlântico." }
        ]
    }
};

export class QuestionEngine {
    private static instance: QuestionEngine;
    private performanceHistory: { correct: boolean; difficulty: Difficulty }[] = [];

    private constructor() {}

    static getInstance(): QuestionEngine {
        if (!QuestionEngine.instance) {
            QuestionEngine.instance = new QuestionEngine();
        }
        return QuestionEngine.instance;
    }

    recordPerformance(correct: boolean, difficulty: Difficulty) {
        this.performanceHistory.push({ correct, difficulty });
        if (this.performanceHistory.length > 20) {
            this.performanceHistory.shift();
        }
    }

    getStats() {
        const total = this.performanceHistory.length;
        const correct = this.performanceHistory.filter(p => p.correct).length;
        const byDifficulty = {
            easy: this.performanceHistory.filter(p => p.difficulty === 'easy').length,
            medium: this.performanceHistory.filter(p => p.difficulty === 'medium').length,
            hard: this.performanceHistory.filter(p => p.difficulty === 'hard').length,
            extreme: this.performanceHistory.filter(p => p.difficulty === 'extreme').length,
        };
        
        return {
            total,
            correct,
            accuracy: total > 0 ? (correct / total) * 100 : 0,
            byDifficulty
        };
    }

    // Determine difficulty based ENTIRELY on the game level (match level 1 to 100)
    private calculateDifficultyByLevel(gameLevel: number): Difficulty {
        if (gameLevel <= 15) return 'easy';
        if (gameLevel <= 40) return 'medium';
        if (gameLevel <= 75) return 'hard';
        return 'extreme';
    }

    generateQuestion(difficultyOverride?: Difficulty, gameLevel: number = 1): Question {
        // Difficulty scales tightly with the match's gameLevel
        const diff = difficultyOverride || this.calculateDifficultyByLevel(gameLevel);
        
        // Select random subject
        const subjects: Subject[] = ['math', 'portuguese', 'science', 'history', 'geography'];
        const selectedSubject = subjects[Math.floor(Math.random() * subjects.length)];

        if (selectedSubject === 'math') {
            return this.generateMathQuestion(diff, gameLevel);
        } else {
            return this.generateStaticQuestion(selectedSubject, diff);
        }
    }

    private generateStaticQuestion(subject: Subject, difficulty: Difficulty): Question {
        // @ts-ignore
        const bank = QUESTION_BANKS[subject][difficulty];
        const randomQ = bank[Math.floor(Math.random() * bank.length)];
        
        // Shuffle options
        const shuffledOptions = [...randomQ.options].sort(() => Math.random() - 0.5);

        return {
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: randomQ.text,
            answer: randomQ.answer,
            options: shuffledOptions,
            explanation: randomQ.explanation,
            difficulty: difficulty,
            subject: subject
        };
    }

    private generateMathQuestion(difficulty: Difficulty, level: number): Question {
        switch (difficulty) {
            case 'extreme': return this.generateExtremeMathQuestion(level);
            case 'hard': return this.generateHardMathQuestion(level);
            case 'medium': return this.generateMediumMathQuestion(level);
            case 'easy':
            default: return this.generateEasyMathQuestion(level);
        }
    }

    private generateEasyMathQuestion(level: number): Question {
        const isAddition = Math.random() > 0.5;
        let a, b, answer, text, explanation;
        const maxVal = 10 + (level * 2);

        if (isAddition) {
            a = Math.floor(Math.random() * maxVal) + 1;
            b = Math.floor(Math.random() * maxVal) + 1;
            answer = a + b;
            text = `${a} + ${b}`;
            explanation = `${a} mais ${b} resulta em ${answer}.`;
        } else {
            a = Math.floor(Math.random() * (maxVal * 1.5)) + 10;
            b = Math.floor(Math.random() * a) + 1;
            answer = a - b;
            text = `${a} - ${b}`;
            explanation = `Subtraindo ${b} de ${a}, restam ${answer}.`;
        }

        return {
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text, answer,
            options: this.generateMathOptions(answer, level),
            explanation, difficulty: 'easy', subject: 'math'
        };
    }

    private generateMediumMathQuestion(level: number): Question {
        const isMultiplication = Math.random() > 0.4;
        let a, b, answer, text, explanation;
        const maxVal = 8 + Math.floor(level / 2);

        if (isMultiplication) {
            a = Math.floor(Math.random() * maxVal) + 2;
            b = Math.floor(Math.random() * 10) + 2;
            answer = a * b;
            text = `${a} × ${b}`;
            explanation = `${a} vezes ${b} é igual a ${answer}.`;
        } else {
            b = Math.floor(Math.random() * 10) + 2;
            answer = Math.floor(Math.random() * (maxVal)) + 2;
            a = b * answer;
            text = `${a} ÷ ${b}`;
            explanation = `${a} dividido por ${b} dá ${answer}.`;
        }

        return {
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text, answer,
            options: this.generateMathOptions(answer, level),
            explanation, difficulty: 'medium', subject: 'math'
        };
    }

    private generateHardMathQuestion(level: number): Question {
        const type = Math.floor(Math.random() * 3);
        let a, b, c, answer, text, explanation;
        const multMax = 5 + Math.floor(level / 5);

        if (type === 0) {
            b = Math.floor(Math.random() * multMax) + 2;
            c = Math.floor(Math.random() * multMax) + 2;
            a = Math.floor(Math.random() * (level * 2)) + 1;
            answer = a + (b * c);
            text = `${a} + ${b} × ${c}`;
            explanation = `Primeiro multiplicamos: ${b} × ${c} = ${b * c}. Depois somamos: ${a} + ${b * c} = ${answer}.`;
        } else if (type === 1) {
            a = Math.floor(Math.random() * multMax) + 2;
            b = Math.floor(Math.random() * multMax) + 2;
            c = Math.floor(Math.random() * (a * b - 1)) + 1;
            answer = (a * b) - c;
            text = `${a} × ${b} - ${c}`;
            explanation = `Primeiro multiplicamos: ${a} × ${b} = ${a * b}. Depois subtraímos: ${a * b} - ${c} = ${answer}.`;
        } else {
            a = Math.floor(Math.random() * (multMax)) + 1;
            b = Math.floor(Math.random() * (multMax)) + 1;
            c = Math.floor(Math.random() * 5) + 2;
            answer = (a + b) * c;
            text = `(${a} + ${b}) × ${c}`;
            explanation = `Resolvemos os parênteses: ${a} + ${b} = ${a + b}. Multiplicamos: ${a + b} × ${c} = ${answer}.`;
        }

        return {
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text, answer,
            options: this.generateMathOptions(answer, level),
            explanation, difficulty: 'hard', subject: 'math'
        };
    }

    private generateExtremeMathQuestion(level: number): Question {
        const type = Math.floor(Math.random() * 3);
        let a, b, c, answer, text, explanation;
        const maxVal = 10 + Math.floor(level / 3);

        if (type === 0) {
            // Square roots
            answer = Math.floor(Math.random() * maxVal) + 5;
            a = answer * answer;
            text = `√${a}`;
            explanation = `A raiz quadrada de ${a} é ${answer}, pois ${answer} × ${answer} = ${a}.`;
        } else if (type === 1) {
            // Complex order of operations
            a = Math.floor(Math.random() * maxVal) + 5;
            b = Math.floor(Math.random() * 10) + 2;
            c = Math.floor(Math.random() * 10) + 2;
            answer = (a * b) - (c * c);
            text = `${a} × ${b} - ${c}²`;
            explanation = `Multiplicação: ${a}×${b}=${a*b}. Potência: ${c}²=${c*c}. Subtraindo: ${a*b} - ${c*c} = ${answer}.`;
        } else {
            // Percentages
            a = (Math.floor(Math.random() * 9) + 1) * 10; // 10, 20... 90
            answer = Math.floor(Math.random() * (maxVal * 2)) + 10;
            b = (answer * 100) / a;
            text = `${a}% de ${b}`;
            explanation = `${a}% de ${b} é ${answer}.`;
        }

        return {
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text, answer,
            options: this.generateMathOptions(answer, level),
            explanation, difficulty: 'extreme', subject: 'math'
        };
    }

    private generateMathOptions(answer: number, level: number): number[] {
        const options = new Set<number>();
        options.add(answer);
        
        const variance = Math.max(5, Math.floor(level / 5));

        while (options.size < 4) {
            let offset;
            const rand = Math.random();
            
            if (rand < 0.3) {
                offset = Math.floor(Math.random() * variance) - (variance/2);
            } else if (rand < 0.6) {
                offset = (Math.random() > 0.5 ? 10 : -10);
            } else {
                offset = Math.floor(Math.random() * (variance * 4)) - (variance * 2);
            }

            const opt = Math.floor(answer + offset);
            if (opt !== answer) {
                options.add(opt);
            }
        }

        return Array.from(options).sort(() => Math.random() - 0.5);
    }
}
