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
    const TARGET_LOCATION = {
        lat: 40.691111,  // buraya kendi koordinatın
        lng: 29.607271,
    };
    const MAX_DISTANCE = 200; // metre
    //const [code, setCode] = useState("");
    //const [expireTime, setExpireTime] = useState(null);
    const frameRef = useRef(null)
    const [inputText, setInputText] = useState('');
    const [characterCount, setCharacterCount] = useState(0);
    const [isLocationAllowed, setIsLocationAllowed] = useState(false);
    const videoRef = useRef(null);
    const maxChars = 35;
    const [previewImage, setPreviewImage] = useState(null);

    const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // dünya yarıçapı (metre)
        const toRad = (deg) => deg * Math.PI / 180;

        const φ1 = toRad(lat1);
        const φ2 = toRad(lat2);
        const Δφ = toRad(lat2 - lat1);
        const Δλ = toRad(lon2 - lon1);

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.setAttribute("crossorigin", "anonymous");
        }
    }, []);

    useEffect(() => {
        if (!isLocationAllowed) return;

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
    }, [isLocationAllowed]);

    useEffect(() => {
        // Sayfa yüklenince hemen değil, 1 saniye sonra konumu iste
        const timer = setTimeout(() => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    const distance = getDistanceInMeters(userLat, userLng, TARGET_LOCATION.lat, TARGET_LOCATION.lng);

                    if (distance <= MAX_DISTANCE) {
                        setIsLocationAllowed(true);
                        setIsVerified(true);
                    } else {
                        alert("Mekana çok uzaktasın.");
                    }
                },
                (error) => {
                    console.error("Konum hatası detayı:", error);
                    // Burası "Reddedildi" (Code 1) diyorsa tarayıcı isteği bloklamıştır.
                    setIsLocationAllowed(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        },); // 1000 ms = 1 saniye bekle

        return () => clearTimeout(timer);
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
        if (!frameRef.current) return;

        const canvas = await html2canvas(frameRef.current, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true,
        });

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

    if (!isLocationAllowed) {
        return (
            <div className="location-check-container">
                <div className="location-card">

                    <div className="spinner"></div>

                    <h2>Konum Doğrulanıyor</h2>
                    <p>Lütfen bekleyin, bulunduğunuz yer kontrol ediliyor...</p>
                </div>
            </div>
        );
    }
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