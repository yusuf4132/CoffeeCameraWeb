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
        if (!frameRef.current) return;
    
        const canvas = await html2canvas(frameRef.current, {
            backgroundColor: "#ffffff",
            scale: 2 // 🔥 kaliteyi artırır
        });
    
        const imageData = canvas.toDataURL("image/png");
    
        setPreviewImage(imageData);
    };
    const handleConfirmPrint = () => {
        console.log("Yazıcıya gönderiliyor...");

        // 🔥 BURAYA yazıcı kodun gelecek

        setPreviewImage(null); // modal kapat
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

                <button onClick={handleTakePhoto} className="take-photo-btn">
                    Resim Çek
                </button>
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