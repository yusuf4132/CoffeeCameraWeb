import React, { useState, useRef, useEffect } from 'react';
import './ThermalPrinterPage.css'; // Aşağıdaki CSS dosyasını oluşturun
import html2canvas from "html2canvas";

// Yer tutucu resim yolları (Kendi dosya yollarınızla değiştirin)
// Örnek: import logo from './assets/logo.png';
const logoPng = 'isma_logo.png'; // Sadece 'R' logosu
const coffeeRotaTextPng = 'isma_yazi.png'; // 'COFFEE ROTA' metni logosu

function ThermalPrinterPage() {
    const frameRef = useRef(null)
    const [inputText, setInputText] = useState('');
    const [characterCount, setCharacterCount] = useState(0);
    const videoRef = useRef(null);
    const canvasRef = useRef(null); // Resmi birleştirmek için kullanılacak
    const maxChars = 35;
    const [previewImage, setPreviewImage] = useState(null);
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.setAttribute("crossorigin", "anonymous");
        }
    }, []);

    // Kamera akışını başlat
    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Kameraya erişilemedi:", err);
                // Hata durumunda kullanıcıya bilgi verilebilir
            }
        }
        startCamera();
    }, []);

    const handleInputChange = (event) => {
        const text = event.target.value;
        if (text.length <= maxChars) {
            setInputText(text);
            setCharacterCount(text.length);
        }
    };

    const handleTakePhoto = () => {
        console.log("Resim çekiliyor ve birleştiriliyor...");
        combineAndPrepareForPrint();
    };

    const combineAndPrepareForPrint = async () => {
        const video = videoRef.current;
        if (!video) return;
    
        // 👇 ekranda görünen ölçüyü al (çok önemli!)
        const width = video.offsetWidth;
        const height = video.offsetHeight;
    
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
    
        canvas.width = width;
        canvas.height = height;
    
        // 🔥 SADECE kamerayı ters çevir
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, width, height);
    
        // 🔥 normale dön (yazı/logo ters olmasın)
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    
        // ✍️ ÜST YAZI
        ctx.fillStyle = "#222";
        ctx.font = "20px Poppins";
        ctx.textAlign = "center";
        ctx.fillText(inputText, width / 2, 30);
    
        // 🔻 LOGOLAR (async yüklenir)
        const logoLeft = new Image();
        const logoRight = new Image();
        const logoText = new Image();
    
        logoLeft.src = logoPng;
        logoRight.src = logoPng;
        logoText.src = coffeeRotaTextPng;
    
        Promise.all([
            new Promise(res => logoLeft.onload = res),
            new Promise(res => logoRight.onload = res),
            new Promise(res => logoText.onload = res),
        ]).then(() => {
    
            const y = height - 40;
    
            ctx.drawImage(logoLeft, 10, y, 30, 30);
            ctx.drawImage(logoText, width / 2 - 40, y + 5, 80, 20);
            ctx.drawImage(logoRight, width - 40, y, 30, 30);
    
            const imageData = canvas.toDataURL("image/png");
            setPreviewImage(imageData);
        });
    };
    const handleConfirmPrint = () => {
        console.log("Yazıcıya gönderiliyor...");
    
        // 👉 buraya printer kodu gelecek
    
        setPreviewImage(null);
    };

    return (
        <div className="container">

            {/* ÜST */}
            <div className="top-section">
                <div className="logo-section">
                    <img src={logoPng} alt="Logo" className="main-logo-r" />
                    <img src={coffeeRotaTextPng} alt="Coffee Rota Text" className="main-logo-text" />
                </div>
                <h1 className="welcome-text">Hoşgeldiniz</h1>
            </div>

            {/* ORTA (KAMERA) */}
            <div className="middle-section">
                <div className="camera-frame" ref={frameRef}>
                    <div className="user-text-overlay">
                        {inputText}
                    </div>

                    <div className="video-wrapper">
                        <video ref={videoRef} autoPlay playsInline muted className="video-feed" />
                    </div>

                    <div className="frame-bottom-logos">
                        <img src={logoPng} alt="Logo" className="frame-logo-r" />
                        <img src={coffeeRotaTextPng} alt="Coffee Rota Text" className="frame-logo-text" />
                        <img src={logoPng} alt="Logo" className="frame-logo-r" />
                    </div>
                </div>
            </div>

            {/* ALT */}
            <div className="bottom-section">
                <button onClick={handleTakePhoto} className="take-photo-btn">
                    Resim Çek
                </button>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Emoji ve İsminizi Ekle..."
                        value={inputText}
                        onChange={handleInputChange}
                        maxLength={maxChars}
                        className="name-input"
                    />
                    <div className="char-counter">
                        {characterCount}/{maxChars}
                    </div>
                </div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

            {previewImage && (
                <div className="preview-overlay">
                    <div className="preview-modal">
                        <img src={previewImage} alt="Preview" />

                        <button onClick={handleConfirmPrint} className="confirm-btn">
                            Onayla ve Yazdır
                        </button>

                        <button onClick={() => setPreviewImage(null)} className="cancel-btn">
                            İptal
                        </button>
                    </div>
                </div>
            )}

        </div>

    ); // return parantezi kapandı
} // Fonksiyon (ThermalPrinterPage) süslü parantezi kapandı

export default ThermalPrinterPage;