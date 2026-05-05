import React, { useState, useRef, useEffect } from 'react';
import './ThermalPrinterPage.css'; // Aşağıdaki CSS dosyasını oluşturun
import html2canvas from "html2canvas";
import { supabase } from "./supabaseClient";

// Yer tutucu resim yolları (Kendi dosya yollarınızla değiştirin)
// Örnek: import logo from './assets/logo.png';
const logoPng = 'isma_logo.png'; // Sadece 'R' logosu
const coffeeRotaTextPng = 'isma_yazi.png'; // 'COFFEE ROTA' metni logosu

function ThermalPrinterPage() {
    const [isVerified, setIsVerified] = useState(false);
    //const [code, setCode] = useState("");
    //const [expireTime, setExpireTime] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState("filter1");
    const frameRef = useRef(null);
    const [inputText, setInputText] = useState('');
    const [characterCount, setCharacterCount] = useState(0);
    const [isLocationAllowed, setIsLocationAllowed] = useState(false);
    const videoRef = useRef(null);
    const maxChars = 35;
    const [previewImage, setPreviewImage] = useState(null);


    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.setAttribute("crossorigin", "anonymous");
        }
    }, []);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                    audio: false
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Kamera hatası:", err);
            }
        };

        startCamera();
    }, []);

    /*useEffect(() => {
        if (!expireTime) return;

        const interval = setInterval(() => {
            if (new Date().toISOString > expireTime) {
                alert("Süren doldu");
                setIsVerified(false);
                setCode("");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expireTime]);*/

    /*const verifyCode = async () => {
        const { data } = await supabase
            .from("codes")
            .select("*")
            .eq("code", code)
            .single();

        if (!data) {
            alert("Kod yanlış");
            return;
        }

        if (data.used) {
            alert("Kod kullanılmış");
            return;
        }

        if (new Date(data.expires_at) < new Date().toISOString()) {
            alert("Süre dolmuş");
            return;
        }

        await supabase
            .from("codes")
            .update({ used: true })
            .eq("id", data.id);

        setExpireTime(new Date(data.expires_at));
        setIsVerified(true);
    };*/

    const applyThermalFilter = (ctx, canvas, filterType) => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // gri ton
            let gray = 0.3 * r + 0.59 * g + 0.11 * b;

            if (filterType === "filter1") {
                // Sert siyah-beyaz (threshold)
                gray = gray > 128 ? 255 : 0;
            }

            else if (filterType === "filter2") {
                // Daha kontrastlı
                gray = gray * 1.4;
                gray = gray > 120 ? 255 : 0;
            }

            else if (filterType === "filter3") {
                // Yumuşak gri + hafif threshold
                gray = gray * 1.2;
                gray = gray > 160 ? 255 : gray;
            }

            else if (filterType === "filter4") {
                // Dither efekti (basit)
                const noise = Math.random() * 50;
                gray = gray + noise > 140 ? 255 : 0;
            }

            data[i] = data[i + 1] = data[i + 2] = gray;
        }

        ctx.putImageData(imageData, 0, 0);
    };



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
    /*const combineAndPrepareForPrint = async () => { if (!frameRef.current) return; const canvas = await html2canvas(frameRef.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true, }); const imageData = canvas.toDataURL("image/png"); setPreviewImage(imageData); };*/
    const combineAndPrepareForPrint = async (filterType) => {
        if (!frameRef.current) return;

        const canvas = await html2canvas(frameRef.current, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true,
        });

        const ctx = canvas.getContext("2d");

        applyThermalFilter(ctx, canvas, filterType);

        const imageData = canvas.toDataURL("image/png");
        setPreviewImage(imageData);
    };
    const handleConfirmPrint = () => {
        if (!previewImage) return;

        const link = document.createElement("a");
        link.href = previewImage;
        link.download = `photo_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // temizleme
        setPreviewImage(null);
        setInputText("");
    };

    /*if (!isVerified) {
        return (
            <div className="verify-container">
                <div className="verify-box">
                    <h2>Kod Gir</h2>
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Kodunuzu girin"
                    />
                    <button onClick={verifyCode}>Giriş</button>
                </div>
            </div>
        );
    }*/
    return (
        <div className="container">

            {/* ÜST */}
            <div className="top-section">
                <div className="logo-section">
                    <img src={logoPng} alt="Logo" className="main-logo-r" />
                    <img src={coffeeRotaTextPng} alt="Coffee Rota Text" className="main-logo-text" />
                </div>
                <h1 className="welcome-text">Hoşgeldiniz</h1>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Emoji veya İsmini Ekle..."
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

            {/* ORTA (KAMERA) */}
            <div className="middle-section">
                <div className="camera-frame" ref={frameRef}>
                    <div className="camera-inner">
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
            </div>

            {/* ALT */}
            <div className="bottom-section">
                {/*<button onClick={handleTakePhoto} className="take-photo-btn">
                    Resim Çek
    </button>*/}
                <div className="bottom-section">
                    <button onClick={() => combineAndPrepareForPrint("filter1")}>
                        Filtre 1 (Sert)
                    </button>

                    <button onClick={() => combineAndPrepareForPrint("filter2")}>
                        Filtre 2 (Kontrast)
                    </button>

                    <button onClick={() => combineAndPrepareForPrint("filter3")}>
                        Filtre 3 (Yumuşak)
                    </button>

                    <button onClick={() => combineAndPrepareForPrint("filter4")}>
                        Filtre 4 (Dither)
                    </button>
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

    );
}
export default ThermalPrinterPage;