import React, { useState, useRef, useEffect } from 'react';
import './ThermalPrinterPage.css';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "./supabaseClient";

const logoPng = 'isma_logo.png'; // Sadece 'R' logosu
const coffeeRotaTextPng = 'isma_yazi.png'; // 'COFFEE ROTA' metni logosu

function ThermalPrinterPage() {
    const [successMessage, setSuccessMessage] = useState(false);
    //const [isVerified, setIsVerified] = useState(false);
    //const [code, setCode] = useState("");
    //const [expireTime, setExpireTime] = useState(null);
    //const [isLocationAllowed, setIsLocationAllowed] = useState(false);
    const [loading, setLoading] = useState(false);
    const frameRef = useRef(null);
    const [inputText, setInputText] = useState('');
    const [characterCount, setCharacterCount] = useState(0);
    const videoRef = useRef(null);
    const maxChars = 35;
    const [previewImage, setPreviewImage] = useState(null);
    const [cameraError, setCameraError] = useState(false);
    const [tableNo, setTableNo] = useState(null);
    const [copyCount, setCopyCount] = useState(1);
    const [showCopySelect, setShowCopySelect] = useState(false);

    useEffect(() => {
        const initCamera = async () => {
            setLoading(true);
            try {
                // kamera açma kodların
            } finally {
                setLoading(false);
            }
        };
        initCamera();
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
        const params = new URLSearchParams(window.location.search);
        const masa = params.get("masa");

        if (masa) {
            setTableNo(masa);
        }
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

    const handleTakePhoto = async () => {
        if (!tableNo) {
            alert("Lütfen masadaki QR kodu okutun.");
            return;
        }

        setLoading(true);
        try {
            console.log("Fotoğraf çekiliyor ve birleştiriliyor...");
            combineAndPrepareForPrint();
        } finally {
            setLoading(false);
        }

    };
    const combineAndPrepareForPrint = async () => {
        if (!frameRef.current) return;
        const canvas = await html2canvas(frameRef.current, { backgroundColor: "#ffffff", scale: 4, useCORS: true, });
        const imageData = canvas.toDataURL("image/png");
        setPreviewImage(imageData);
    };

    const handleConfirmPrint = async () => {
        setLoading(true);
        try {

            const { data, error } = await supabase
                .rpc("increment_print_counter", {
                    p_count: copyCount
                });

            if (error) {
                console.error(error);
                return;
            }

            const { inner_index, outer_index } = data[0];
            if (!previewImage) return;

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const img = new Image();

            img.onload = async () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Canvas'ı döndürülmüş boyuta göre ayarla
                canvas.width = img.height;
                canvas.height = img.width;

                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(Math.PI / 2);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);

                const rotatedImage = canvas.toDataURL("image/png");

                const pageHeight = 297; // A4 yüksekliği
                const photoWidth = 67.8;
                const photoHeight = 53;

                const slot = outer_index;
                const cols = 3;
                const rows = 5;

                const slotsPerPage = cols * rows;
                const positionInPage = slot % slotsPerPage;

                const marginTop = 11.0;
                const marginBottom = 11;
                const usableHeight = pageHeight - marginTop - marginBottom;
                //const rowSpacing = usableHeight / rows;
                const row = Math.floor(positionInPage / cols);
                const col = positionInPage % cols;

                const horizontalGap = 1.525; // mm (sütunlar arası boşluk)
                const verticalGap = 2;   // mm (satırlar arası boşluk)

                const startX = 1.8;
                const startY = marginTop;

                const x = startX + col * (photoWidth + horizontalGap);
                const y = startY + row * (photoHeight + verticalGap);
                //const x = 1.76 + col * photoWidth;
                //const y = marginTop + row * rowSpacing;

                if (slot === 0 && outer_index !== 0) {
                    pdf.addPage();
                }

                pdf.addImage(rotatedImage, "PNG", x, y, photoWidth, photoHeight);

                //pdf.save(`photo_sheet_${Date.now()}.pdf`);
                const pdfBlob = pdf.output("blob");

                const fileName = `job_${Date.now()}.pdf`;
                const { error: uploadError } =
                    await supabase.storage
                        .from("print-jobs")
                        .upload(fileName, pdfBlob);

                if (uploadError) {
                    console.error(uploadError);
                    return;
                }

                const { error } = await supabase
                    .from("print_jobs")
                    .insert({

                        pdf_path: fileName,

                        status: "waiting",

                        copy_count: copyCount


                    });

                if (error) {
                    console.error(error);
                    return;
                }

                setPreviewImage(null);
                setInputText("");
                setShowCopySelect(false);
                setCopyCount(null);
                setLoading(false);
                setSuccessMessage(true);
                setTimeout(() => {
                    setSuccessMessage(false);
                }, 3000);
            };

            img.src = previewImage;

        } finally {
            //setLoading(false);
        }

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
                        {tableNo && !previewImage && (
                            <div className="table-number">
                                {tableNo}
                            </div>
                        )}
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
                    Fotoğraf Çek
                </button>
            </div>

            {previewImage && (
                <div className="preview-overlay">
                    <div className="preview-modal">

                        {!showCopySelect ? (
                            <>
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                />

                                <button
                                    onClick={() => setShowCopySelect(true)}
                                    className="confirm-btn"
                                >
                                    İlerle
                                </button>
                            </>
                        ) : (
                            <div className='a'>
                                <h2>
                                    Kişi sayısı seçin
                                </h2>

                                <div className="copy-selector">

                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setCopyCount(num)}
                                            className={
                                                copyCount === num
                                                    ? "copy-box selected"
                                                    : "copy-box"
                                            }
                                        >
                                            {num}
                                        </button>
                                    ))}

                                </div>


                                <button
                                    onClick={handleConfirmPrint}
                                    disabled={!copyCount || loading}
                                    className="confirm-btn"
                                >
                                    Onayla ve Yazdır
                                </button>
                            </div>
                        )}


                        <button
                            onClick={() => {
                                setPreviewImage(null);
                                setShowCopySelect(false);
                                setCopyCount(null);
                            }}
                            className="cancel-btn"
                        >
                            İptal
                        </button>

                    </div>
                </div>
            )}
            {loading && (
                <div className="loading-overlay">
                    <div className="loader"></div>
                </div>
            )}
            {successMessage && (
                <div className="success-overlay">
                    <div className="success-dialog">
                        <div className="success-icon">
                            ✓
                        </div>

                        <div className="success-title">
                            İşleminiz Tamamlandı
                        </div>

                        <div className="success-text">
                            Fotoğrafınız başarıyla yazdırıldı.
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
export default ThermalPrinterPage;