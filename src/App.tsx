// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  Type,
  FunctionDeclaration,
} from '@google/genai';

import {
  AppState,
  UserProfile,
  HealthCondition,
  MobilityLevel,
  AssessmentData,
  DeviceRecommendation,
  Gender,
} from './types';

import { HEALTH_CONDITIONS_LIST, MOCK_VIDEOS } from './constants';
import { getDeviceRecommendations } from './services/geminiService';
import { saveToGoogleSheet, registerUser, checkLogin } from './services/sheetService';
import { lineService } from './services/lineService';
import Layout from './components/Layout';

const t = {
  th: {
    welcome: "ยินดีต้อนรับสู่ GO CANE",
    tagline: "ค้นหาอุปกรณ์ที่ใช่ ด้วยการวิเคราะห์เชิงกายภาพ",
    loginBtn: "เข้าสู่ระบบด้วย LINE",
    manualLoginBtn: "เข้าสู่ระบบด้วยเบอร์โทรศัพท์",
    loggingIn: "กำลังเชื่อมต่อ LINE...",
    manualLoginTitle: "เข้าสู่ระบบ",
    registerTitle: "ลงทะเบียนสมาชิกใหม่",
    registerDesc: "กรุณากรอกข้อมูลเพื่อสร้างบัญชี",
    phoneLabel: "เบอร์โทรศัพท์",
    passwordLabel: "รหัสผ่าน",
    regBtn: "ลงทะเบียน",
    loginSubmitBtn: "เข้าสู่ระบบ",
    noAccount: "ยังไม่มีบัญชี?",
    registerLink: "สมัครสมาชิกที่นี่",
    haveAccount: "มีบัญชีอยู่แล้ว?",
    loginLink: "เข้าสู่ระบบเลย",
    infoTitle: "ข้อมูลพื้นฐาน",
    infoDesc: "กรุณาระบุข้อมูลพื้นฐานเพื่อเริ่มต้นใช้งาน",
    healthInfoDesc: "ข้อมูลสุขภาพเพื่อการวิเคราะห์ที่แม่นยำ (สำหรับตัวคุณเอง)",
    createProfileDesc: "สร้างโปรไฟล์สำหรับผู้สูงอายุที่คุณต้องการดูแล",
    nameLabel: "ชื่อ-นามสกุล",
    ageLabel: "อายุ (ปี)",
    weightLabel: "น้ำหนัก (กก.)",
    heightLabel: "ส่วนสูง (ซม.)",
    genderLabel: "เพศ",
    diseaseLabel: "โรคประจำตัว (เลือกได้มากกว่า 1)",
    continueBtn: "ถัดไป",
    startAssess: "เริ่มการประเมิน",
    selectTitle: "ต้องการเลือกอุปกรณ์ให้ใครคะ?",
    self: "สำหรับตัวเอง",
    others: "สำหรับผู้อื่น",
    assess1: "ความมั่นคงในการเดิน",
    viewResult: "วิเคราะห์ผลลัพธ์",
    resultFor: "ผลสำหรับคุณ:",
    sortByQ: "เน้นคุณภาพ",
    sortByP: "ราคาประหยัด",
    insight: "🩺 Professional Physiotherapy Insight",
    buyBtn: "สั่งซื้อ",
    chatInit: "สวัสดีค่ะ นักกายภาพบำบัดวิชาชีพยินดีให้คำปรึกษาค่ะ คุณมีข้อสงสัยตรงไหนไหมคะ?",
    chatTyping: "นักกายภาพบำบัดกำลังพิมพ์...",
    chatPlaceholder: "พิมพ์คำถามของคุณ...",
    voiceWelcome: "สวัสดีค่ะ ยินดีต้อนรับสู่ GO CANE ต้องการให้ฉันช่วยแนะนำการใช้งานแอปไหมคะ?",
    step2: "การประเมินความสามารถทางกายภาพ",
    sitStandLabel: "การลุกจากนั่งเป็นยืน (จากเก้าอี้มีความสูงปกติ)",
    strengthLabel: "ความแข็งแรงของกล้ามเนื้อแขน",
    strengthHint: "ลองบีบมือผู้อื่นหรือกำสิ่งของแน่นๆ",
    weightBearingLabel: "การลงน้ำหนักที่ขา",
    budgetLabel: "งบประมาณสำหรับอุปกรณ์",
    optSit1: "ลุกได้เอง ไม่ต้องใช้มือยัน",
    optSit2: "ต้องใช้มือยัน 1 ข้าง",
    optSit3: "ต้องใช้มือยัน 2 ข้าง หรือต้องมีคนพยุง",
    optSit4: "ลุกเองไม่ได้เลย",
    optStr1: "แข็งแรง (กำมือแน่น/ยันตัวลอยได้)",
    optStr2: "ปานกลาง (พอยันตัวได้บ้าง)",
    optStr3: "อ่อนแรง (กำมือไม่แน่น)",
    optWB1: "ลงน้ำหนักได้เต็มที่ ไม่เจ็บ",
    optWB2: "ลงได้บ้างแต่เจ็บ/เสียว",
    optWB3: "ลงน้ำหนักไม่ได้เลย",
    optBud1: "ประหยัด (ไม่เกิน 1,000 บาท)",
    optBud2: "ปานกลาง (1,000 - 3,000 บาท)",
    optBud3: "คุณภาพสูง (มากกว่า 3,000 บาท)"
  },
  en: {
    welcome: "Welcome to GO CANE",
    tagline: "Find the right tool with physical analysis.",
    loginBtn: "Login with LINE",
    manualLoginBtn: "Login with Phone Number",
    loggingIn: "Connecting to LINE...",
    manualLoginTitle: "Login",
    registerTitle: "Register New Account",
    registerDesc: "Please create an account.",
    phoneLabel: "Phone Number",
    passwordLabel: "Password",
    regBtn: "Register",
    loginSubmitBtn: "Login",
    noAccount: "No account?",
    registerLink: "Register here",
    haveAccount: "Already have an account?",
    loginLink: "Login here",
    infoTitle: "Basic Information",
    infoDesc: "Please provide basic information to start.",
    healthInfoDesc: "Health information for accurate analysis (For Yourself).",
    createProfileDesc: "Create a profile for the elderly person.",
    nameLabel: "Full Name",
    ageLabel: "Age (Years)",
    weightLabel: "Weight (kg)",
    heightLabel: "Height (cm)",
    genderLabel: "Gender",
    diseaseLabel: "Conditions (Select all that apply)",
    continueBtn: "Next",
    startAssess: "Start Assessment",
    selectTitle: "Who are you searching for?",
    self: "For Myself",
    others: "For Someone Else",
    assess1: "Walking Stability",
    viewResult: "Analyze Results",
    resultFor: "Results for:",
    sortByQ: "Quality",
    sortByP: "Budget",
    insight: "🩺 Professional Physiotherapy Insight",
    buyBtn: "Purchase",
    chatInit: "Hello, I'm your physical therapist. How can I assist you today?",
    chatTyping: "Therapist is typing...",
    chatPlaceholder: "Type your question...",
    voiceWelcome: "Hello, welcome to GO CANE. Would you like an assistant to guide you through the app?",
    step2: "Physical Capability Assessment",
    sitStandLabel: "Sit-to-Stand Ability",
    strengthLabel: "Upper Body Strength",
    strengthHint: "Try squeezing a hand or object firmly",
    weightBearingLabel: "Weight Bearing Status",
    budgetLabel: "Budget",
    optSit1: "Independent (No hands needed)",
    optSit2: "Need 1 hand support",
    optSit3: "Need 2 hands support or assistance",
    optSit4: "Unable to stand",
    optStr1: "Strong",
    optStr2: "Moderate",
    optStr3: "Weak",
    optWB1: "Full weight bearing",
    optWB2: "Partial (Painful)",
    optWB3: "Non-weight bearing",
    optBud1: "Low (< 1,000 THB)",
    optBud2: "Medium (1,000 - 3,000 THB)",
    optBud3: "High (> 3,000 THB)"
  }
};

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('LOGIN');
  const [language, setLanguage] = useState<'th' | 'en'>('th');

  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);

  const [assessment, setAssessment] = useState<AssessmentData>({
    mobilityLevel: MobilityLevel.INDEPENDENT,
    upperBodyStrength: 'moderate',
    sitToStand: 'independent',
    weightBearing: 'full',
    primaryEnvironment: 'both',
    budgetRange: 'medium',
  });

  const [recommendations, setRecommendations] = useState<DeviceRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'quality'>('quality');
  const [globalScale, setGlobalScale] = useState<number>(1);

  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'expert'; text: string }[]>([]);
  const [isExpertTyping, setIsExpertTyping] = useState(false);

  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const curT = t[language];

  // LINE Init
  useEffect(() => {
    const initLine = async () => {
      const isLoggedIn = await lineService.init();
      if (isLoggedIn) {
        const profile = await lineService.getProfile();
        if (profile) {
          setCurrentUserProfile({
            name: profile.displayName,
            age: 0,
            isSelf: true,
            lineId: profile.userId,
          });
          setState('COMPLETE_BASIC_INFO');
        }
      }
    };
    initLine();
  }, []);

  const handleLineLogin = () => {
    setIsLoggingIn(true);
    const isRedirecting = lineService.login();

    if (isRedirecting) return;

    setTimeout(() => {
      setIsLoggingIn(false);
      setState('REGISTER');
    }, 1500);
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const password = fd.get('password') as string;

    if (!password) {
      alert(language === 'th' ? 'กรุณากรอกรหัสผ่าน' : 'Please enter a password');
      setLoading(false);
      return;
    }

    const profile: UserProfile = {
      name: (fd.get('name') as string) || '',
      age: parseInt((fd.get('age') as string) || '0', 10),
      phoneNumber: (fd.get('phone') as string) || '',
      lineId: `manual_${Date.now()}`,
      isSelf: true,
    };

    await registerUser(profile, password);

    setCurrentUserProfile(profile);
    setLoading(false);
    setState('PROFILE_SELECTION');
  };

  const handleManualLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const phone = (fd.get('phone') as string) || '';
    const password = (fd.get('password') as string) || '';

    const result = await checkLogin(phone, password);
    setLoading(false);

    if (result && result.success) {
      setCurrentUserProfile({
        name: result.name || "User",
        age: result.age || 60,
        phoneNumber: phone,
        isSelf: true,
      });
      setState('PROFILE_SELECTION');
    } else {
      alert(language === 'th' ? "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง" : "Invalid phone or password");
    }
  };

  const performVoiceLogin = () => {
    if (state === 'LOGIN') {
      handleLineLogin();
      return { success: true, message: language === 'th' ? "กำลังเข้าสู่ระบบผ่าน LINE ให้ค่ะ" : "Logging you in via LINE." };
    }
    return { success: false, message: "Already in." };
  };

  const closeAssistant = () => {
    try {
      // stop scheduled audio
      sourcesRef.current.forEach(s => {
        try { s.stop(); } catch { /* ignore */ }
      });
      sourcesRef.current.clear();
      nextStartTimeRef.current = 0;

      if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
      }
    } finally {
      setIsAssistantActive(false);
    }
    return { success: true };
  };

  const handleAssistantToggle = async () => {
    if (isAssistantActive) {
      closeAssistant();
      return;
    }

    try {
      setIsAssistantActive(true);

      const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
      if (!apiKey) {
        alert(language === 'th'
          ? 'ยังไม่ได้ตั้งค่า VITE_API_KEY ใน Environment Variables'
          : 'Missing VITE_API_KEY in environment variables');
        setIsAssistantActive(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (outputAudioCtx.state === 'suspended') {
        await outputAudioCtx.resume();
      }

      let pageContext = "";
      switch (state) {
        case 'LOGIN': pageContext = language === 'th' ? "หน้าแรก" : "Home"; break;
        case 'REGISTER': pageContext = language === 'th' ? "ลงทะเบียนสมาชิก" : "Register"; break;
        case 'COMPLETE_BASIC_INFO': pageContext = language === 'th' ? "กรอกข้อมูลพื้นฐาน" : "Basic Information"; break;
        case 'COMPLETE_HEALTH_INFO': pageContext = language === 'th' ? "กรอกข้อมูลสุขภาพ" : "Health Information"; break;
        case 'RESULTS': pageContext = language === 'th' ? "ผลลัพธ์การประเมิน" : "Assessment Results"; break;
        default: pageContext = language === 'th' ? "ใช้งานทั่วไป" : "General";
      }

      const loginTool: FunctionDeclaration = {
        name: 'performLogin',
        description: 'Login via LINE when user says start or login.',
        parameters: { type: Type.OBJECT, properties: {} }
      };

      const closeTool: FunctionDeclaration = {
        name: 'closeAssistant',
        description: 'Close the assistant if user says no or close.',
        parameters: { type: Type.OBJECT, properties: {} }
      };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const silence = new Uint8Array(1024);

            sessionPromise.then(s => {
              s.sendRealtimeInput({
                media: { data: encode(silence), mimeType: 'audio/pcm;rate=16000' }
              });
            });

            const source = inputAudioCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtx.createScriptProcessor(4096, 1, 1);

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;

              sessionPromise.then(s =>
                s.sendRealtimeInput({
                  media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
                })
              );
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtx.destination);
          },

          onmessage: async (message: LiveServerMessage) => {
            // --- TS-safe tool calls ---
            const functionCalls = message.toolCall?.functionCalls ?? [];
            for (const fc of functionCalls) {
              if (fc.name === 'performLogin') {
                const res = performVoiceLogin();
                sessionPromise.then(s =>
                  s.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: res }
                  })
                );
              } else if (fc.name === 'closeAssistant') {
                closeAssistant();
              }
            }

            // --- TS-safe audio parts ---
            const parts = message.serverContent?.modelTurn?.parts ?? [];
            const base64Audio = parts[0]?.inlineData?.data;

            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioCtx, 24000, 1);

              const src = outputAudioCtx.createBufferSource();
              src.buffer = audioBuffer;
              src.connect(outputAudioCtx.destination);
              src.addEventListener('ended', () => sourcesRef.current.delete(src));

              src.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(src);
            }
          },

          onclose: () => {
            setIsAssistantActive(false);
            stream.getTracks().forEach(t => t.stop());
          },

          onerror: () => {
            setIsAssistantActive(false);
            stream.getTracks().forEach(t => t.stop());
          },
        },

        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: [loginTool, closeTool] }],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: `You are 'GO CANE Assistant', a professional physical therapist aide.
Language: ${language.toUpperCase()}.
Current Context: User is at "${pageContext}".

BEHAVIOR:
- Introduce "GO CANE" app: "แอปพลิเคชันช่วยเลือกอุปกรณ์ช่วยเดินที่เหมาะสมและปลอดภัย".
- Ask if they need help with the current step.
- Speak naturally, kindly, and slowly for elderly users.
- If the user is silent, gently introduce yourself.`,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      setIsAssistantActive(false);
    }
  };

  const handleBasicInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUserProfile) return;

    const fd = new FormData(e.currentTarget);
    const profile: UserProfile = {
      ...currentUserProfile,
      name: (fd.get('name') as string) || currentUserProfile.name || '',
      age: parseInt((fd.get('age') as string) || String(currentUserProfile.age || 0), 10),
      isSelf: true,
    };

    setCurrentUserProfile(profile);
    setState('PROFILE_SELECTION');
  };

  const handleHealthInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const conditions: HealthCondition[] = [];
    HEALTH_CONDITIONS_LIST.forEach(c => { if (fd.get(c)) conditions.push(c); });

    if (currentUserProfile) {
      const updatedProfile: UserProfile = {
        ...currentUserProfile,
        weight: parseFloat((fd.get('weight') as string) || '0'),
        height: parseFloat((fd.get('height') as string) || '0'),
        gender: (fd.get('gender') as Gender) || Gender.NOT_SPECIFIED,
        conditions: conditions.length > 0 ? conditions : [HealthCondition.NONE],
        isSelf: true,
      };
      setCurrentUserProfile(updatedProfile);
      setTargetProfile(updatedProfile);
      setState('ASSESSMENT');
    }
  };

  const handleCreateProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const conditions: HealthCondition[] = [];
    HEALTH_CONDITIONS_LIST.forEach(c => { if (fd.get(c)) conditions.push(c); });

    const profile: UserProfile = {
      name: (fd.get('name') as string) || '',
      age: parseInt((fd.get('age') as string) || '0', 10),
      weight: parseFloat((fd.get('weight') as string) || '0'),
      height: parseFloat((fd.get('height') as string) || '0'),
      gender: (fd.get('gender') as Gender) || Gender.NOT_SPECIFIED,
      conditions: conditions.length > 0 ? conditions : [HealthCondition.NONE],
      isSelf: false,
    };

    setTargetProfile(profile);
    setState('ASSESSMENT');
  };

  const handleAssessmentSubmit = async () => {
    if (!targetProfile) return;

    setLoading(true);

    // Avoid mutating state object directly: create normalized copy
    const normalizedTarget: UserProfile = {
      ...targetProfile,
      conditions: targetProfile.conditions ?? [HealthCondition.NONE],
      gender: targetProfile.gender ?? Gender.NOT_SPECIFIED,
    };

    const results = await getDeviceRecommendations(normalizedTarget, assessment, language);
    setRecommendations(results);

    await saveToGoogleSheet(normalizedTarget, assessment);

    setLoading(false);
    setState('RESULTS');
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    if (sortBy === 'price') return a.approxPrice - b.approxPrice;
    if (sortBy === 'quality') return b.qualityRating - a.qualityRating;
    return 0;
  });

  const headingClass = 'text-xl font-bold';
  const labelClass = 'text-sm font-bold text-gray-600';

  const renderBasicFields = () => (
    <div className="md:grid md:grid-cols-2 md:gap-6 space-y-4 md:space-y-0">
      <div>
        <label className={labelClass}>{curT.nameLabel}</label>
        <input
          required
          name="name"
          defaultValue={currentUserProfile?.name || ''}
          className="w-full p-4 bg-gray-50 border border-pink-100 rounded-2xl outline-none"
        />
      </div>
      <div>
        <label className={labelClass}>{curT.ageLabel}</label>
        <input
          required
          name="age"
          type="number"
          defaultValue={currentUserProfile?.age || ''}
          className="w-full p-4 bg-gray-50 border border-pink-100 rounded-2xl outline-none"
        />
      </div>
    </div>
  );

  const renderHealthFields = () => (
    <>
      <div>
        <label className={labelClass}>{curT.genderLabel}</label>
        <select
          name="gender"
          className="w-full p-4 bg-gray-50 border border-pink-100 rounded-2xl outline-none"
          defaultValue={Gender.NOT_SPECIFIED}
        >
          {Object.values(Gender).map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{curT.weightLabel}</label>
          <input name="weight" type="number" step="1" className="w-full p-4 bg-gray-50 border border-pink-100 rounded-2xl outline-none" />
        </div>
        <div>
          <label className={labelClass}>{curT.heightLabel}</label>
          <input name="height" type="number" step="1" className="w-full p-4 bg-gray-50 border border-pink-100 rounded-2xl outline-none" />
        </div>
      </div>

      <div>
        <label className={labelClass}>{curT.diseaseLabel}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {HEALTH_CONDITIONS_LIST.map(c => (
            <label
              key={c}
              className="flex items-center gap-3 p-4 bg-white border-2 border-pink-50 rounded-2xl text-sm font-bold cursor-pointer hover:border-pink-300 transition-all shadow-sm has-[:checked]:bg-pink-50 has-[:checked]:border-pink-400 has-[:checked]:text-pink-700"
            >
              <input type="checkbox" name={c} className="w-5 h-5 accent-pink-500 rounded-md" /> {c}
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <Layout
      title={state === 'RESULTS' ? (language === 'th' ? 'ผลวิเคราะห์' : 'Results') : 'GO CANE'}
      onBack={state !== 'LOGIN' ? () => {
        if (state === 'RESULTS') setState('ASSESSMENT');
        else if (state === 'ASSESSMENT') setState(targetProfile?.isSelf ? 'COMPLETE_HEALTH_INFO' : 'CREATE_PROFILE');
        else if (state === 'COMPLETE_HEALTH_INFO' || state === 'CREATE_PROFILE') setState('PROFILE_SELECTION');
        else if (state === 'PROFILE_SELECTION') setState('LOGIN');
        else if (state === 'REGISTER' || state === 'LOGIN_MANUAL') setState('LOGIN');
        else if (state === 'COMPLETE_BASIC_INFO') setState('PROFILE_SELECTION');
        else setState('LOGIN');
      } : undefined}
      onChat={state === 'RESULTS' ? () => setState('CHAT') : undefined}
      fontSize={globalScale}
      onFontSizeChange={setGlobalScale}
      onToggleAssistant={handleAssistantToggle}
      isAssistantActive={isAssistantActive}
      language={language}
      onLanguageChange={setLanguage}
    >
      {state === 'LOGIN' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-28 h-28 bg-pink-400 rounded-[2.5rem] mb-8 flex items-center justify-center text-white text-5xl font-black shadow-lg ring-8 ring-pink-50">GO</div>
          <h1 className={`${headingClass} text-pink-700 mb-2 tracking-tight`}>{curT.welcome}</h1>
          <p className={`text-sm text-gray-400 mb-12 max-w-[220px] leading-relaxed mx-auto`}>
            {curT.tagline}
          </p>

          <div className="space-y-4 w-full max-w-xs mx-auto">
            <button
              onClick={handleLineLogin}
              disabled={isLoggingIn}
              className="w-full bg-[#06C755] text-white font-bold p-4 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <span>{curT.loggingIn}</span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                    <path d="M24 10.3c0-4.6-4.7-8.3-10.5-8.3S3 5.7 3 10.3c0 4.1 3.7 7.5 8.7 8.2.3.1.8.2 1 .5.1.1.2.4.1.6 0 .3-.3 1.1-.4 1.4-.1.5-.6 1.8.2 1.8.8 0 4.4-2.6 6-4.4 3.7-3.2 5.4-5.4 5.4-8.1z" />
                  </svg>
                  {curT.loginBtn}
                </>
              )}
            </button>

            <button
              onClick={() => setState('LOGIN_MANUAL')}
              className="w-full bg-white text-pink-500 border-2 border-pink-100 font-bold p-4 rounded-3xl active:scale-95 transition-all"
            >
              {curT.manualLoginBtn}
            </button>
          </div>
        </div>
      )}

      {/* Manual Login */}
      {state === 'LOGIN_MANUAL' && (
        <form onSubmit={handleManualLoginSubmit} className="space-y-6 max-w-sm mx-auto mt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-pink-600 mb-2">{curT.manualLoginTitle}</h2>
            <div className="w-16 h-1 bg-pink-200 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>{curT.phoneLabel}</label>
              <input required name="phone" type="tel" className="w-full p-4 bg-gray-50 border border-pink-100 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
            <div>
              <label className={labelClass}>{curT.passwordLabel}</label>
              <input required name="password" type="password" className="w-full p-4 bg-gray-50 border border-pink-100 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-pink-500 text-white font-bold p-4 rounded-3xl shadow-lg active:scale-95 transition-all disabled:opacity-50">
            {loading ? '...' : curT.loginSubmitBtn}
          </button>

          <p className="text-center text-xs text-gray-500">
            {curT.noAccount}{' '}
            <span onClick={() => setState('REGISTER')} className="text-pink-500 font-bold underline cursor-pointer">
              {curT.registerLink}
            </span>
          </p>
        </form>
      )}

      {/* Manual Register */}
      {state === 'REGISTER' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-pink-600 mb-2">{curT.registerTitle}</h2>
            <p className="text-sm text-gray-400">{curT.registerDesc}</p>
          </div>

          <div className="md:grid md:grid-cols-2 md:gap-6 space-y-4 md:space-y-0">
            <div>
              <label className={labelClass}>{curT.nameLabel}</label>
              <input required name="name" className="w-full p-4 bg-gray-50 border border-pink-100 rounded-2xl outline-none" />
            </div>
            <div>
              <label className={labelClass}>{curT.ageLabel}</label>
              <input required name="age" type="number" className="w-full p-4 bg-gray-50 border border-pink-100 rounded-2xl outline-none" />
            </div>
          </div>

          <div>
            <label className={labelClass}>{curT.phoneLabel}</label>
            <input required name="phone" type="tel" className="w-full p-4 bg-gray-50 border border-pink-100 rounded-2xl outline-none" />
          </div>

          <div>
            <label className={labelClass}>{curT.passwordLabel}</label>
            <input required name="password" type="password" className="w-full p-4 bg-gray-50 border border-pink-100 rounded-2xl outline-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-pink-400 text-white font-bold p-4 rounded-3xl shadow-lg active:scale-95 transition-all">
            {loading ? '...' : curT.regBtn}
          </button>

          <p className="text-center text-xs text-gray-500">
            {curT.haveAccount}{' '}
            <span onClick={() => setState('LOGIN_MANUAL')} className="text-pink-500 font-bold underline cursor-pointer">
              {curT.loginLink}
            </span>
          </p>
        </form>
      )}

      {state === 'COMPLETE_BASIC_INFO' && (
        <form onSubmit={handleBasicInfoSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-pink-50 p-4 rounded-3xl text-pink-700 border border-pink-100 text-xs">{curT.infoDesc}</div>
          <div className="space-y-4">{renderBasicFields()}</div>
          <button type="submit" className="w-full bg-pink-400 text-white font-bold p-4 rounded-3xl shadow-lg active:scale-95 transition-all">
            {curT.continueBtn}
          </button>
        </form>
      )}

      {state === 'PROFILE_SELECTION' && (
        <div className="space-y-6 mt-4 max-w-xl mx-auto">
          <p className="text-center text-gray-400">{curT.selectTitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setState('COMPLETE_HEALTH_INFO')}
              className="w-full bg-white border-2 border-pink-200 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 active:scale-95 shadow-sm hover:shadow-md transition-all h-full justify-center"
            >
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-400 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-center md:text-left font-bold">{curT.self}</div>
            </button>

            <button
              onClick={() => setState('CREATE_PROFILE')}
              className="w-full bg-white border-2 border-orange-100 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 active:scale-95 shadow-sm hover:shadow-md transition-all h-full justify-center"
            >
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-400 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="text-center md:text-left font-bold">{curT.others}</div>
            </button>
          </div>
        </div>
      )}

      {state === 'COMPLETE_HEALTH_INFO' && (
        <form onSubmit={handleHealthInfoSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-pink-50 p-4 rounded-3xl text-pink-700 border border-pink-100 text-xs">{curT.healthInfoDesc}</div>
          <div className="space-y-4">{renderHealthFields()}</div>
          <button type="submit" className="w-full bg-pink-400 text-white font-bold p-4 rounded-3xl shadow-lg active:scale-95 transition-all">
            {curT.startAssess}
          </button>
        </form>
      )}

      {state === 'CREATE_PROFILE' && (
        <form onSubmit={handleCreateProfileSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-orange-50 p-4 rounded-3xl text-orange-700 border border-orange-100 text-xs">{curT.createProfileDesc}</div>
          <div className="space-y-4">
            {renderBasicFields()}
            {renderHealthFields()}
          </div>
          <button type="submit" className="w-full bg-orange-400 text-white font-bold p-4 rounded-3xl shadow-lg active:scale-95 transition-all">
            {curT.startAssess}
          </button>
        </form>
      )}

      {state === 'ASSESSMENT' && (
        <div className="space-y-8 max-w-3xl mx-auto">
          <h2 className={`${headingClass} text-pink-700`}>{curT.step2}</h2>

          <section>
            <h3 className="text-gray-700 mb-3 font-bold flex items-center gap-3 text-sm">
              <span className="w-6 h-6 bg-pink-400 text-white rounded-full flex items-center justify-center text-xs">1</span>
              {curT.assess1}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.values(MobilityLevel).map(level => (
                <button
                  key={level}
                  onClick={() => setAssessment({ ...assessment, mobilityLevel: level })}
                  className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.mobilityLevel === level ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </section>

          {/* Sit-to-stand */}
          <section>
            <h3 className="text-gray-700 mb-3 font-bold flex items-center gap-3 text-sm">
              <span className="w-6 h-6 bg-pink-400 text-white rounded-full flex items-center justify-center text-xs">2</span>
              {curT.sitStandLabel}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button onClick={() => setAssessment({ ...assessment, sitToStand: 'independent' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.sitToStand === 'independent' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optSit1}</button>
              <button onClick={() => setAssessment({ ...assessment, sitToStand: 'one_hand' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.sitToStand === 'one_hand' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optSit2}</button>
              <button onClick={() => setAssessment({ ...assessment, sitToStand: 'two_hands' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.sitToStand === 'two_hands' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optSit3}</button>
              <button onClick={() => setAssessment({ ...assessment, sitToStand: 'unable' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.sitToStand === 'unable' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optSit4}</button>
            </div>
          </section>

          {/* Strength */}
          <section>
            <h3 className="text-gray-700 mb-1 font-bold flex items-center gap-3 text-sm">
              <span className="w-6 h-6 bg-pink-400 text-white rounded-full flex items-center justify-center text-xs">3</span>
              {curT.strengthLabel}
            </h3>
            <p className="text-[10px] text-gray-400 ml-9 mb-3">{curT.strengthHint}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button onClick={() => setAssessment({ ...assessment, upperBodyStrength: 'strong' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.upperBodyStrength === 'strong' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optStr1}</button>
              <button onClick={() => setAssessment({ ...assessment, upperBodyStrength: 'moderate' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.upperBodyStrength === 'moderate' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optStr2}</button>
              <button onClick={() => setAssessment({ ...assessment, upperBodyStrength: 'weak' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.upperBodyStrength === 'weak' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optStr3}</button>
            </div>
          </section>

          {/* Weight bearing */}
          <section>
            <h3 className="text-gray-700 mb-3 font-bold flex items-center gap-3 text-sm">
              <span className="w-6 h-6 bg-pink-400 text-white rounded-full flex items-center justify-center text-xs">4</span>
              {curT.weightBearingLabel}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button onClick={() => setAssessment({ ...assessment, weightBearing: 'full' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.weightBearing === 'full' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optWB1}</button>
              <button onClick={() => setAssessment({ ...assessment, weightBearing: 'partial' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.weightBearing === 'partial' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optWB2}</button>
              <button onClick={() => setAssessment({ ...assessment, weightBearing: 'none' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.weightBearing === 'none' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optWB3}</button>
            </div>
          </section>

          {/* Budget */}
          <section>
            <h3 className="text-gray-700 mb-3 font-bold flex items-center gap-3 text-sm">
              <span className="w-6 h-6 bg-pink-400 text-white rounded-full flex items-center justify-center text-xs">5</span>
              {curT.budgetLabel}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button onClick={() => setAssessment({ ...assessment, budgetRange: 'low' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.budgetRange === 'low' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optBud1}</button>
              <button onClick={() => setAssessment({ ...assessment, budgetRange: 'medium' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.budgetRange === 'medium' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optBud2}</button>
              <button onClick={() => setAssessment({ ...assessment, budgetRange: 'high' })} className={`w-full p-3 text-left rounded-2xl border-2 text-sm transition-all ${assessment.budgetRange === 'high' ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold' : 'border-gray-50 bg-white text-gray-500'}`}>{curT.optBud3}</button>
            </div>
          </section>

          <button disabled={loading} onClick={handleAssessmentSubmit} className="w-full bg-pink-400 text-white font-bold p-4 rounded-3xl shadow-xl active:scale-95 transition-all">
            {loading ? '...' : curT.viewResult}
          </button>
        </div>
      )}

      {state === 'RESULTS' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-pink-400">{curT.resultFor} {targetProfile?.name}</h4>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="text-[10px] bg-pink-50 p-2 rounded-xl font-bold text-pink-600 outline-none">
              <option value="quality">{curT.sortByQ}</option>
              <option value="price">{curT.sortByP}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRecommendations.map(device => (
              <div key={device.id} className="bg-white rounded-[2.5rem] border border-pink-50 shadow-xl p-6 flex flex-col">
                <h3 className="text-lg font-black text-pink-600 mb-4">{device.name}</h3>

                <div className="bg-pink-50/50 p-5 rounded-3xl mb-5 border border-pink-100/50 flex-1">
                  <p className="text-[10px] font-black text-pink-400 mb-2 uppercase tracking-widest">{curT.insight}</p>
                  <p className="text-xs text-gray-600 italic leading-relaxed">"{device.reason}"</p>
                </div>

                <iframe
                  className="w-full aspect-video rounded-3xl mb-5 shadow-inner"
                  src={(MOCK_VIDEOS as any)[device.tutorialVideoId] || MOCK_VIDEOS.CANE}
                  frameBorder="0"
                  allowFullScreen
                />

                <div className="space-y-3 mt-auto">
                  {device.purchaseLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl bg-gray-50/30">
                      <span className="text-[10px] font-bold text-gray-400">{link.vendor}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-pink-600">฿{link.price.toLocaleString()}</span>
                        <a href={link.url} target="_blank" className="bg-pink-400 text-white text-[10px] font-black px-4 py-2 rounded-xl">
                          {curT.buyBtn}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {state === 'CHAT' && (
        <div className="flex flex-col h-[calc(100vh-220px)]">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-hide">
            <div className="flex justify-start">
              <div className="bg-pink-50 p-5 rounded-3xl rounded-tl-none text-sm text-pink-700 max-w-[85%]">
                {curT.chatInit}
              </div>
            </div>

            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.sender === 'user' ? 'bg-pink-400 text-white rounded-tr-none' : 'bg-white border border-pink-50 text-gray-800 rounded-tl-none'} p-5 rounded-3xl max-w-[85%] text-sm shadow-sm transition-all`}>
                  {m.text}
                </div>
              </div>
            ))}

            {isExpertTyping && (
              <div className="text-[10px] text-pink-300 animate-pulse font-bold px-4 italic">{curT.chatTyping}</div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const i = e.currentTarget.elements.namedItem('msg') as HTMLInputElement | null;
              if (!i?.value) return;

              setChatMessages(p => [...p, { sender: 'user', text: i.value }]);
              i.value = '';
              setIsExpertTyping(true);

              setTimeout(() => {
                setChatMessages(p => [
                  ...p,
                  {
                    sender: 'expert',
                    text: language === 'th'
                      ? "ได้รับคำถามแล้วค่ะ นักกายภาพจะตอบกลับผ่าน LINEOA เร็วๆ นี้"
                      : "Question received. A therapist will reply via LINEOA soon."
                  }
                ]);
                setIsExpertTyping(false);
              }, 2000);
            }}
            className="flex gap-2 bg-white pt-3 border-t border-pink-50"
          >
            <input
              name="msg"
              autoComplete="off"
              className="flex-1 bg-gray-50 border border-pink-100 rounded-3xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder={curT.chatPlaceholder}
            />
            <button type="submit" className="bg-pink-400 text-white p-4 rounded-3xl shadow-md shrink-0">
              <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default App;
