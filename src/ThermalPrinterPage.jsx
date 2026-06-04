import React, { useState, useRef, useEffect } from 'react';
import './ThermalPrinterPage.css'; // Aşağıdaki CSS dosyasını oluşturun
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
    const [cameraError, setCameraError] = useState(false);


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

                setCameraError(false);
            } catch (err) {
                console.error("Kamera hatası:", err);
                setCameraError(true);
            }
        };

        startCamera();
    }, []);
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
    
        // Video karesini al
        const captureCanvas = document.createElement("canvas");
        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;
    
        const ctx = captureCanvas.getContext("2d");
    
        ctx.drawImage(
            video,
            0,
            0,
            captureCanvas.width,
            captureCanvas.height
        );
    
        // Sonra html2canvas ile frame'i oluştur
        const frameCanvas = await html2canvas(frameRef.current, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true
        });
    
        setPreviewImage(frameCanvas.toDataURL("image/png"));
    };

    const handleConfirmPrint = async () => {
        if (!previewImage) return;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const img = new Image();

        img.onload = () => {

            // Tek fotoğraf boyutu
            const photoWidth = 63.5;   // mm
            const photoHeight = 72; // mm

            // 5 sütun x 5 satır
            const cols = 3;
            const rows = 4;

            // Sayfa kenar boşluğu
            const marginX = 8;
            const marginY = 8;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {

                    const x = marginX + col * photoWidth;
                    const y = marginY + row * photoHeight;

                    pdf.addImage(
                        previewImage,
                        "PNG",
                        x,
                        y,
                        photoWidth,
                        photoHeight
                    );
                }
            }

            pdf.save(`photo_sheet_${Date.now()}.pdf`);

            setPreviewImage(null);
            setInputText("");
        };

        img.src = previewImage;
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
                            {cameraError ? (
                                <img
                                    src={logoPng}
                                    alt="ISMA Logo"
                                    className="camera-placeholder"
                                />
                            ) : (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="video-feed"
                                />
                            )}
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
                <button onClick={handleTakePhoto} className="take-photo-btn">
                    Resim Çek
                </button>
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