"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getStoreProductById, updateStoreProduct, StoreProduct } from "@/services/storage";
import Swal from "sweetalert2";
import { ArrowLeft, Save, Shirt, Tag, DollarSign, Image as ImageIcon, Ruler, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { IKContext, IKUpload } from 'imagekitio-react';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Camisa");
    const [imageUrl, setImageUrl] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

    const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "Unica"];

    useEffect(() => {
        if (id) {
            loadProduct();
        }
    }, [id]);

    const loadProduct = async () => {
        try {
            const product = await getStoreProductById(id);
            if (product) {
                setName(product.name);
                setDescription(product.description);
                setPrice(product.price.toString());
                setCategory(product.category);
                setImageUrl(product.imageUrl);
                setImages(product.images || (product.imageUrl ? [product.imageUrl] : []));
                setSelectedSizes(product.sizes || []);
            } else {
                Swal.fire("Error", "Producto no encontrado", "error");
                router.push("/tienda");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Error al cargar producto", "error");
        } finally {
            setFetching(false);
        }
    };

    const handleSizeToggle = (size: string) => {
        if (selectedSizes.includes(size)) {
            setSelectedSizes(selectedSizes.filter(s => s !== size));
        } else {
            setSelectedSizes([...selectedSizes, size]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const productData: Partial<StoreProduct> = {
            name,
            description,
            price: Number(price),
            category,
            imageUrl,
            images,
            sizes: selectedSizes
        };

        try {
            await updateStoreProduct(id, productData);
            Swal.fire("¡Éxito!", "Producto actualizado correctamente", "success");
            router.push("/tienda");
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo actualizar", "error");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/tienda"
                            className="group flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-white flex items-center gap-3">
                                <ShoppingBag className="w-8 h-8 text-purple-400" />
                                Editar Producto
                            </h1>
                            <p className="text-slate-400 mt-1">Modificar detalles de la prenda</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Info Card */}
                    <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/20">
                        <div className="space-y-6">

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    <Shirt className="w-4 h-4 text-blue-400" />
                                    Nombre del Producto
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej. Camiseta Oversize Wingx..."
                                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-purple-500/50 focus:bg-black/40 outline-none transition-all text-white placeholder-slate-500"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    <Tag className="w-4 h-4 text-emerald-400" />
                                    Descripción
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detalles sobre la tela, ajuste, etc..."
                                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-purple-500/50 focus:bg-black/40 outline-none transition-all text-white placeholder-slate-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Price */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                        <DollarSign className="w-4 h-4 text-amber-400" />
                                        Precio (USD)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="50.00"
                                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-purple-500/50 focus:bg-black/40 outline-none transition-all text-white placeholder-slate-500 font-mono"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                        <Tag className="w-4 h-4 text-pink-400" />
                                        Tipo de Prenda
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-purple-500/50 focus:bg-black/40 outline-none transition-all text-white appearance-none cursor-pointer"
                                    >
                                        <option value="Camisa" className="text-slate-900">Camisa</option>
                                        <option value="Pantalón" className="text-slate-900">Pantalón</option>
                                        <option value="Vestido" className="text-slate-900">Vestido</option>
                                        <option value="Falda" className="text-slate-900">Falda</option>
                                        <option value="Chaleco" className="text-slate-900">Chaleco</option>
                                        <option value="Chaqueta" className="text-slate-900">Chaqueta</option>
                                        <option value="Short" className="text-slate-900">Short</option>
                                        <option value="Conjunto" className="text-slate-900">Conjunto</option>
                                        <option value="Accesorio" className="text-slate-900">Accesorio</option>
                                        <option value="Otro" className="text-slate-900">Otro</option>
                                    </select>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                                    Imágenes del Producto (Máx 5)
                                </label>

                                <IKContext
                                    publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
                                    urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                                    authenticator={async () => {
                                        const response = await fetch("/api/auth/imagekit");
                                        if (!response.ok) throw new Error("Failed to auth imagekit");
                                        return response.json();
                                    }}
                                >
                                    <div className="flex flex-col gap-4">
                                        <IKUpload
                                            fileName={`product_${Date.now()}`}
                                            folder="/catalogo"
                                            onSuccess={(res: any) => {
                                                console.log("Upload success", res);
                                                const newImages = [...images, res.url];
                                                setImages(newImages);
                                                // Set first image as main automatically if none set
                                                if (!imageUrl) setImageUrl(res.url);

                                                Swal.fire({
                                                    toast: true,
                                                    icon: 'success',
                                                    title: 'Imagen agregada',
                                                    position: 'top-end',
                                                    showConfirmButton: false,
                                                    timer: 2000
                                                });
                                            }}
                                            onError={(err: any) => {
                                                console.error("Upload error", err);
                                                Swal.fire("Error", "No se pudo subir la imagen", "error");
                                            }}
                                            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20 transition-all cursor-pointer"
                                        />

                                        <p className="text-xs text-slate-500">
                                            La primera imagen será la portada. Haz clic en una imagen para establecerla como portada.
                                        </p>
                                    </div>
                                </IKContext>

                                {/* Images Grid */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        {images.map((img, idx) => (
                                            <div key={idx} className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${imageUrl === img ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/10'}`}>
                                                <img
                                                    src={img}
                                                    alt={`Product ${idx}`}
                                                    className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
                                                    onClick={() => setImageUrl(img)}
                                                />
                                                {imageUrl === img && (
                                                    <div className="absolute top-2 left-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm pointer-events-none">
                                                        PORTADA
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = images.filter(i => i !== img);
                                                        setImages(newImages);
                                                        if (imageUrl === img && newImages.length > 0) {
                                                            setImageUrl(newImages[0]);
                                                        } else if (newImages.length === 0) {
                                                            setImageUrl("");
                                                        }
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                                                >
                                                    <ArrowLeft className="w-3 h-3 rotate-45" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sizes */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                    <Ruler className="w-4 h-4 text-indigo-400" />
                                    Tallas Disponibles
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {availableSizes.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => handleSizeToggle(size)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${selectedSizes.includes(size)
                                                ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                                                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-4 pt-4">
                        <Link
                            href="/tienda"
                            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-semibold transition-all text-sm"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:shadow-none flex items-center gap-2 text-sm"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
