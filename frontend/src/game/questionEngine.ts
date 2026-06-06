export type Difficulty = 'easy' | 'medium' | 'hard';
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

// Static Question Banks for Non-Math Subjects
const QUESTION_BANKS = {
    portuguese: {
        easy: [
            { text: "Qual o antônimo de 'Bom'?", options: ["Ruim", "Legal", "Feliz", "Triste"], answer: "Ruim", explanation: "O contrário de bom é ruim." },
            { text: "Qual palavra é um substantivo?", options: ["Correr", "Gato", "Lindo", "Rapidamente"], answer: "Gato", explanation: "Gato é o nome de um animal (substantivo)." },
            { text: "Como se separa a sílaba de 'Bolo'?", options: ["Bo-lo", "B-o-lo", "Bol-o", "B-olo"], answer: "Bo-lo", explanation: "Bolo é uma palavra dissílaba: Bo-lo." }
        ],
        medium: [
            { text: "Qual a classificação da palavra 'Árvore'?", options: ["Oxítona", "Paroxítona", "Proparoxítona", "Monossílaba"], answer: "Proparoxítona", explanation: "A antepenúltima sílaba é tônica." },
            { text: "O que é um adjetivo?", options: ["Nome", "Ação", "Característica", "Lugar"], answer: "Característica", explanation: "Adjetivo dá característica ao substantivo." },
            { text: "Qual o plural de 'Cidadão'?", options: ["Cidadãos", "Cidadões", "Cidadães", "Cidadão"], answer: "Cidadãos", explanation: "A forma correta do plural é cidadãos." }
        ],
        hard: [
            { text: "Em 'Vende-se casas', qual a figura de linguagem?", options: ["Metáfora", "Silepse", "Nenhuma, erro de concordância", "Metonímia"], answer: "Nenhuma, erro de concordância", explanation: "O correto é 'Vendem-se casas' (Voz passiva sintética)." },
            { text: "O que é Pleonasmo?", options: ["Omissão", "Redundância", "Exagero", "Atenuação"], answer: "Redundância", explanation: "Pleonasmo é o uso de palavras redundantes (ex: subir para cima)." },
            { text: "Qual é o pretérito mais-que-perfeito do verbo 'falar' (eu)?", options: ["Falei", "Falava", "Falara", "Falarei"], answer: "Falara", explanation: "Eu falara é o pretérito mais-que-perfeito." }
        ]
    },
    science: {
        easy: [
            { text: "O sol é uma:", options: ["Estrela", "Planeta", "Satélite", "Cometa"], answer: "Estrela", explanation: "O Sol é a estrela central do Sistema Solar." },
            { text: "O que nós respiramos para viver?", options: ["Gás Carbônico", "Nitrogênio", "Oxigênio", "Hélio"], answer: "Oxigênio", explanation: "Seres humanos respiram oxigênio." },
            { text: "Qual animal é mamífero?", options: ["Galinha", "Cachorro", "Sapo", "Cobra"], answer: "Cachorro", explanation: "Cachorros mamam quando filhotes." }
        ],
        medium: [
            { text: "Qual é a fórmula da água?", options: ["H2O", "CO2", "NaCl", "O2"], answer: "H2O", explanation: "Dois átomos de hidrogênio e um de oxigênio." },
            { text: "O que é fotossíntese?", options: ["Respiração animal", "Processo de plantas fazerem energia", "Evaporação da água", "Movimento da Terra"], answer: "Processo de plantas fazerem energia", explanation: "Plantas convertem luz solar em energia." },
            { text: "Quantos ossos tem o corpo humano adulto?", options: ["206", "300", "150", "250"], answer: "206", explanation: "O corpo adulto tem exatamente 206 ossos." }
        ],
        hard: [
            { text: "Qual a principal função dos mitocôndrias?", options: ["Síntese de proteínas", "Produção de ATP (energia)", "Divisão celular", "Digestão intracelular"], answer: "Produção de ATP (energia)", explanation: "Elas são as 'usinas' de energia da célula." },
            { text: "Qual é a teoria de Albert Einstein?", options: ["Gravitação Universal", "Evolução", "Relatividade", "Leis de Newton"], answer: "Relatividade", explanation: "E = mc² é parte da teoria da relatividade." },
            { text: "O que é um buraco negro?", options: ["Um planeta escuro", "Região do espaço com gravidade extrema", "Uma estrela anã", "Uma nebulosa"], answer: "Região do espaço com gravidade extrema", explanation: "A gravidade é tão forte que nem a luz escapa." }
        ]
    },
    history: {
        easy: [
            { text: "Quem descobriu o Brasil?", options: ["Pedro Álvares Cabral", "Cristóvão Colombo", "Vasco da Gama", "Dom Pedro I"], answer: "Pedro Álvares Cabral", explanation: "Cabral chegou ao Brasil em 1500." },
            { text: "Em que ano o Brasil foi descoberto?", options: ["1400", "1500", "1822", "1889"], answer: "1500", explanation: "A frota portuguesa chegou em 22 de abril de 1500." },
            { text: "Quem libertou os escravos no Brasil?", options: ["Dom Pedro II", "Princesa Isabel", "Tiradentes", "Zumbi dos Palmares"], answer: "Princesa Isabel", explanation: "Ela assinou a Lei Áurea em 1888." }
        ],
        medium: [
            { text: "De quem o Brasil declarou independência?", options: ["Espanha", "Portugal", "Inglaterra", "França"], answer: "Portugal", explanation: "O Brasil era colônia de Portugal até 1822." },
            { text: "Qual o nome da primeira capital do Brasil?", options: ["Rio de Janeiro", "São Paulo", "Salvador", "Brasília"], answer: "Salvador", explanation: "Salvador foi a primeira capital do Brasil Colonial." },
            { text: "Quando começou a Segunda Guerra Mundial?", options: ["1914", "1939", "1945", "1929"], answer: "1939", explanation: "A guerra começou com a invasão da Polônia em 1939." }
        ],
        hard: [
            { text: "Qual presidente brasileiro sofreu impeachment em 1992?", options: ["Collor de Mello", "Dilma Rousseff", "João Goulart", "Sarney"], answer: "Collor de Mello", explanation: "Collor foi alvo de impeachment em 1992." },
            { text: "O que foi a Guerra Fria?", options: ["Guerra de Inverno na Rússia", "Conflito direto EUA x URSS", "Conflito ideológico EUA x URSS", "Guerra Civil Americana"], answer: "Conflito ideológico EUA x URSS", explanation: "Foi uma disputa política, militar e tecnológica." },
            { text: "Qual foi a última dinastia chinesa?", options: ["Ming", "Han", "Qing", "Tang"], answer: "Qing", explanation: "A dinastia Qing durou até 1912." }
        ]
    },
    geography: {
        easy: [
            { text: "Qual o maior país da América do Sul?", options: ["Argentina", "Brasil", "Chile", "Colômbia"], answer: "Brasil", explanation: "O Brasil tem a maior extensão territorial do subcontinente." },
            { text: "Quantos continentes existem?", options: ["5", "6", "7", "4"], answer: "6", explanation: "América, Europa, África, Ásia, Oceania e Antártida." },
            { text: "O Brasil fica em qual continente?", options: ["Europa", "América", "Ásia", "África"], answer: "América", explanation: "Na América do Sul." }
        ],
        medium: [
            { text: "Qual o maior oceano do mundo?", options: ["Atlântico", "Índico", "Pacífico", "Ártico"], answer: "Pacífico", explanation: "Cobre mais de um terço da superfície da Terra." },
            { text: "Qual a capital da Austrália?", options: ["Sydney", "Melbourne", "Camberra", "Perth"], answer: "Camberra", explanation: "Camberra foi construída para ser a capital." },
            { text: "Onde fica a Floresta Amazônica na maior parte?", options: ["Peru", "Colômbia", "Brasil", "Venezuela"], answer: "Brasil", explanation: "Cerca de 60% da floresta fica no Brasil." }
        ],
        hard: [
            { text: "Qual é o país mais populoso do mundo (2023)?", options: ["China", "Índia", "EUA", "Rússia"], answer: "Índia", explanation: "A Índia ultrapassou a China recentemente." },
            { text: "Qual é a montanha mais alta do mundo?", options: ["K2", "Monte Everest", "Kilimanjaro", "Aconcágua"], answer: "Monte Everest", explanation: "Tem 8.848 metros de altitude." },
            { text: "Em qual país fica o Deserto do Saara?", options: ["Apenas no Egito", "Apenas na Argélia", "Em vários países do Norte da África", "África do Sul"], answer: "Em vários países do Norte da África", explanation: "Cobre quase todo o norte da África." }
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
        };
        
        return {
            total,
            correct,
            accuracy: total > 0 ? (correct / total) * 100 : 0,
            byDifficulty
        };
    }

    // Determine difficulty based ENTIRELY on the game level (match level)
    private calculateDifficultyByLevel(gameLevel: number): Difficulty {
        if (gameLevel <= 2) return 'easy';
        if (gameLevel <= 5) return 'medium';
        return 'hard';
    }

    generateQuestion(difficultyOverride?: Difficulty, gameLevel: number = 1): Question {
        // Difficulty scales tightly with the match's gameLevel
        const diff = difficultyOverride || this.calculateDifficultyByLevel(gameLevel);
        
        // Select random subject
        const subjects: Subject[] = ['math', 'portuguese', 'science', 'history', 'geography'];
        const selectedSubject = subjects[Math.floor(Math.random() * subjects.length)];

        if (selectedSubject === 'math') {
            return this.generateMathQuestion(diff);
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

    private generateMathQuestion(difficulty: Difficulty): Question {
        switch (difficulty) {
            case 'hard': return this.generateHardMathQuestion();
            case 'medium': return this.generateMediumMathQuestion();
            case 'easy':
            default: return this.generateEasyMathQuestion();
        }
    }

    private generateEasyMathQuestion(): Question {
        const isAddition = Math.random() > 0.5;
        let a, b, answer, text, explanation;

        if (isAddition) {
            a = Math.floor(Math.random() * 30) + 1;
            b = Math.floor(Math.random() * 30) + 1;
            answer = a + b;
            text = `${a} + ${b}`;
            explanation = `${a} mais ${b} resulta em ${answer}.`;
        } else {
            a = Math.floor(Math.random() * 50) + 10;
            b = Math.floor(Math.random() * a) + 1;
            answer = a - b;
            text = `${a} - ${b}`;
            explanation = `Subtraindo ${b} de ${a}, restam ${answer}.`;
        }

        return {
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text,
            answer,
            options: this.generateMathOptions(answer),
            explanation,
            difficulty: 'easy',
            subject: 'math'
        };
    }

    private generateMediumMathQuestion(): Question {
        const isMultiplication = Math.random() > 0.4;
        let a, b, answer, text, explanation;

        if (isMultiplication) {
            a = Math.floor(Math.random() * 12) + 2;
            b = Math.floor(Math.random() * 10) + 2;
            answer = a * b;
            text = `${a} × ${b}`;
            explanation = `${a} vezes ${b} é igual a ${answer}.`;
        } else {
            b = Math.floor(Math.random() * 10) + 2;
            answer = Math.floor(Math.random() * 10) + 2;
            a = b * answer;
            text = `${a} ÷ ${b}`;
            explanation = `${a} dividido por ${b} dá ${answer}.`;
        }

        return {
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text,
            answer,
            options: this.generateMathOptions(answer),
            explanation,
            difficulty: 'medium',
            subject: 'math'
        };
    }

    private generateHardMathQuestion(): Question {
        const type = Math.floor(Math.random() * 3);
        let a, b, c, answer, text, explanation;

        if (type === 0) {
            b = Math.floor(Math.random() * 8) + 2;
            c = Math.floor(Math.random() * 6) + 2;
            a = Math.floor(Math.random() * 20) + 1;
            answer = a + (b * c);
            text = `${a} + ${b} × ${c}`;
            explanation = `Primeiro multiplicamos: ${b} × ${c} = ${b * c}. Depois somamos: ${a} + ${b * c} = ${answer}.`;
        } else if (type === 1) {
            a = Math.floor(Math.random() * 10) + 2;
            b = Math.floor(Math.random() * 8) + 2;
            c = Math.floor(Math.random() * (a * b - 1)) + 1;
            answer = (a * b) - c;
            text = `${a} × ${b} - ${c}`;
            explanation = `Primeiro multiplicamos: ${a} × ${b} = ${a * b}. Depois subtraímos: ${a * b} - ${c} = ${answer}.`;
        } else {
            a = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            c = Math.floor(Math.random() * 5) + 2;
            answer = (a + b) * c;
            text = `(${a} + ${b}) × ${c}`;
            explanation = `Primeiro resolvemos os parênteses: ${a} + ${b} = ${a + b}. Depois multiplicamos: ${a + b} × ${c} = ${answer}.`;
        }

        return {
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text,
            answer,
            options: this.generateMathOptions(answer),
            explanation,
            difficulty: 'hard',
            subject: 'math'
        };
    }

    private generateMathOptions(answer: number): number[] {
        const options = new Set<number>();
        options.add(answer);

        while (options.size < 4) {
            let offset;
            const rand = Math.random();
            
            if (rand < 0.3) {
                offset = Math.floor(Math.random() * 6) - 3;
            } else if (rand < 0.6) {
                offset = (Math.random() > 0.5 ? 10 : -10);
            } else {
                offset = Math.floor(Math.random() * 20) - 10;
            }

            const opt = answer + offset;
            if (opt >= 0 && opt !== answer) {
                options.add(opt);
            }
        }

        return Array.from(options).sort(() => Math.random() - 0.5);
    }
}
