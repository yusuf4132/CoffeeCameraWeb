import React, { useState, useRef, useEffect } from 'react';
import './ThermalPrinterPage.css'; // Aşağıdaki CSS dosyasını oluşturun
import html2canvas from "html2canvas";
import * as htmlToImage from 'html-to-image';

// Yer tutucu resim yolları (Kendi dosya yollarınızla değiştirin)
// Örnek: import logo from './assets/logo.png';
const logoPng = 'isma_logo.png'; // Sadece 'R' logosu
const coffeeRotaTextPng = 'isma_yazi.png'; // 'COFFEE ROTA' metni logosu

function ThermalPrinterPage() {
    const frameRef = useRef(null)
    const [inputText, setInputText] = useState('');
    const [characterCount, setCharacterCount] = useState(0);
    const videoRef = useRef(null);
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
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                    }, audio: false
                });
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
        if (!frameRef.current || !videoRef.current) return;

        const video = videoRef.current;
        const frame = frameRef.current;

        try {
            // 1. Video karesini dondur
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = video.videoWidth;
            tempCanvas.height = video.videoHeight;
            tempCanvas.getContext('2d').drawImage(video, 0, 0);
            const videoSnapshot = tempCanvas.toDataURL('image/png');

            // 2. Geçici resmi video üzerine yerleştir
            const tempImg = document.createElement('img');
            tempImg.src = videoSnapshot;
            tempImg.style.position = 'absolute';
            tempImg.style.top = '0';
            tempImg.style.left = '0';
            tempImg.style.width = '100%';
            tempImg.style.height = '100%';
            tempImg.style.objectFit = 'cover';
            tempImg.style.zIndex = '10';

            const videoWrapper = frame.querySelector('.video-wrapper');
            videoWrapper.appendChild(tempImg);

            await new Promise(r => setTimeout(r, 100));

            // 3. Çerçevenin tamamını (Frame) resme dönüştür
            const dataUrl = await htmlToImage.toPng(frame, {
                backgroundColor: '#ffffff',
                pixelRatio: 3,
                filter: (node) => node.tagName !== 'VIDEO'
            });

            // 4. TEMİZLİK
            videoWrapper.removeChild(tempImg);

            // 5. ÖNİZLEMEYE SET ET
            setPreviewImage(dataUrl);

            // --- 6. TELEFONA İNDİRME KISMI (YENİ) ---
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = `CoffeeRota_${Date.now()}.png`; // Dosya adı
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            // ----------------------------------------

        } catch (error) {
            console.error("Hata oluştu:", error);
        }
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