'use client';

import { useState, useRef, useCallback } from 'react';
import {
    Upload,
    Eye,
    Trash2,
    FileText,
    FileVideo,
    File,
    X,
    Download,
    AlertCircle,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────── */
type ModuleCode = 'CS301' | 'CS302' | 'CS401' | 'CS450';
type FileType = 'PDF' | 'PPTX' | 'MP4' | 'DOCX' | 'ZIP' | 'OTHER';

interface Material {
    id: string;
    name: string;
    module: ModuleCode;
    size: string;
    uploadedAt: string;
    downloads: number;
    type: FileType;
    fileUrl?: string; 
}

/* ─── Helpers ────────────────────────────────────────────── */
const MODULE_CODES: ModuleCode[] = ['CS301', 'CS302', 'CS401', 'CS450'];

const MODULE_COLORS: Record<ModuleCode, { bg: string; text: string }> = {
    CS301: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    CS302: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    CS401: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    CS450: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

function getFileType(filename: string): FileType {
    const ext = filename.split('.').pop()?.toUpperCase() ?? '';
    if (['PDF'].includes(ext)) return 'PDF';
    if (['PPT', 'PPTX'].includes(ext)) return 'PPTX';
    if (['MP4', 'MOV', 'AVI', 'WEBM'].includes(ext)) return 'MP4';
    if (['DOC', 'DOCX'].includes(ext)) return 'DOCX';
    if (['ZIP', 'RAR'].includes(ext)) return 'ZIP';
    return 'OTHER';
}

function formatSize(bytes: number): string {
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
    if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
    return `${bytes} B`;
}

function uid() {
    return Math.random().toString(36).slice(2, 10);
}

/* ─── File icon ──────────────────────────────────────────── */
function FileIcon({ type }: { type: FileType }) {
    const base = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl';
    if (type === 'PDF') return <div className={`${base} bg-red-50`}><FileText size={18} className="text-red-400" /></div>;
    if (type === 'PPTX') return <div className={`${base} bg-orange-50`}><FileText size={18} className="text-orange-400" /></div>;
    if (type === 'MP4') return <div className={`${base} bg-blue-50`}><FileVideo size={18} className="text-blue-400" /></div>;
    return <div className={`${base} bg-gray-100`}><File size={18} className="text-gray-400" /></div>;
}

/* ─── Preview Modal ──────────────────────────────────────── */
function PreviewModal({ material, onClose }: { material: Material; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <p className="font-bold text-gray-900 text-sm">{material.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{material.module} • {material.size} • {material.type}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Preview body */}
                <div className="flex items-center justify-center bg-gray-50 min-h-[420px]">
                    {material.fileUrl && material.type === 'PDF' ? (
                        <iframe src={material.fileUrl} className="w-full h-[520px] border-0" title={material.name} />
                    ) : material.fileUrl && material.type === 'MP4' ? (
                        <video controls className="max-h-[480px] max-w-full rounded-lg">
                            <source src={material.fileUrl} />
                        </video>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-center p-8">
                            <FileIcon type={material.type} />
                            <p className="text-sm font-semibold text-gray-700">{material.name}</p>
                            <p className="text-xs text-gray-400">Preview not available for this file type.</p>
                            {material.fileUrl && (
                                <a
                                    href={material.fileUrl}
                                    download={material.name}
                                    className="mt-2 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                                >
                                    <Download size={13} /> Download file
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Upload Modal ───────────────────────────────────────── */
function UploadModal({
    onClose,
    onUpload,
}: {
    onClose: () => void;
    onUpload: (m: Material) => void;
}) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [module, setModule] = useState<ModuleCode>('CS301');
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        setSelectedFile(file);
        setError('');
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, []);

    const handleSubmit = () => {
        if (!selectedFile) { setError('Please select a file.'); return; }
        const url = URL.createObjectURL(selectedFile);
        const material: Material = {
            id: uid(),
            name: selectedFile.name.replace(/\.[^.]+$/, ''), // strip extension from display name
            module,
            size: formatSize(selectedFile.size),
            uploadedAt: 'Just now',
            downloads: 0,
            type: getFileType(selectedFile.name),
            fileUrl: url,
        };
        onUpload(material);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <p className="font-bold text-gray-900">Upload Material</p>
                    <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* Module selector */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Module</label>
                        <select
                            value={module}
                            onChange={(e) => setModule(e.target.value as ModuleCode)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                            {MODULE_CODES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 transition-colors ${dragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/40'
                            }`}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                            <Upload size={20} className="text-emerald-500" />
                        </div>
                        {selectedFile ? (
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-800">{selectedFile.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{formatSize(selectedFile.size)}</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-700">Drop file here or click to browse</p>
                                <p className="text-xs text-gray-400 mt-1">PDF, PPTX, DOCX, MP4, ZIP supported</p>
                            </div>
                        )}
                    </div>
                    <input ref={inputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-500">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                        >
                            Upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Delete Confirm ─────────────────────────────────────── */
function DeleteConfirm({ name, onClose, onConfirm }: { name: string; onClose: () => void; onConfirm: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="font-bold text-gray-900">Delete material?</h3>
                <p className="mt-2 text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">"{name}"</span> will be permanently removed and students will lose access.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Material Row ───────────────────────────────────────── */
function MaterialRow({
    material,
    onPreview,
    onDelete,
}: {
    material: Material;
    onPreview: () => void;
    onDelete: () => void;
}) {
    const mc = MODULE_COLORS[material.module];
    return (
        <div className="flex items-center gap-4 border-b border-gray-50 px-4 py-4 last:border-0 hover:bg-gray-50/60 transition-colors">
            <FileIcon type={material.type} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{material.name}</p>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${mc.bg} ${mc.text}`}>
                        {material.module}
                    </span>
                    <span className="text-xs text-gray-400">
                        {material.size} • {material.uploadedAt} &nbsp; {material.downloads} downloads
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-500">
                    {material.type}
                </span>
                <button
                    onClick={onPreview}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    title="Preview"
                >
                    <Eye size={16} />
                </button>
                <button
                    onClick={onDelete}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

/* ─── Page ───────────────────────────────────────────────── */
const INITIAL_MATERIALS: Material[] = [
    { id: uid(), name: 'Week 1 — Introduction to Algorithms', module: 'CS301', size: '2.4 MB', uploadedAt: '2 days ago', downloads: 34, type: 'PDF' },
    { id: uid(), name: 'Database Design Principles — Lecture Slides', module: 'CS302', size: '5.1 MB', uploadedAt: '1 week ago', downloads: 42, type: 'PPTX' },
    { id: uid(), name: 'Sorting Algorithms — Lab Sheet', module: 'CS401', size: '0.8 MB', uploadedAt: '3 days ago', downloads: 28, type: 'PDF' },
    { id: uid(), name: 'ML Introduction — Video Lecture', module: 'CS450', size: '245 MB', uploadedAt: '1 week ago', downloads: 38, type: 'MP4' },
    { id: uid(), name: 'Week 3 — Binary Trees', module: 'CS301', size: '1.9 MB', uploadedAt: 'Today', downloads: 11, type: 'PDF' },
];

type FilterTab = 'ALL' | ModuleCode;
const FILTER_TABS: FilterTab[] = ['ALL', ...MODULE_CODES] as FilterTab[];

export default function CourseMaterials() {
    const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [previewItem, setPreviewItem] = useState<Material | null>(null);
    const [deleteItem, setDeleteItem] = useState<Material | null>(null);

    const filtered = activeFilter === 'ALL'
        ? materials
        : materials.filter((m) => m.module === activeFilter);

    const handleUpload = (m: Material) => setMaterials((prev) => [m, ...prev]);

    const handleDelete = (id: string) => {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
        setDeleteItem(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Materials</h1>
                    <p className="mt-1 text-sm text-gray-500">Upload and manage learning resources for your modules</p>
                </div>
                <button
                    onClick={() => setUploadOpen(true)}
                    className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                >
                    <Upload size={15} />
                    Upload Material
                </button>
            </div>

            {/* Card */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                {/* Filter tabs */}
                <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-gray-100 flex-wrap">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveFilter(tab)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${activeFilter === tab
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {tab === 'ALL' ? 'All' : tab}
                        </button>
                    ))}
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                            <File size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-400">No materials for {activeFilter}</p>
                        <button
                            onClick={() => setUploadOpen(true)}
                            className="mt-1 text-xs font-semibold text-emerald-500 hover:underline"
                        >
                            Upload the first one →
                        </button>
                    </div>
                ) : (
                    <div>
                        {filtered.map((m) => (
                            <MaterialRow
                                key={m.id}
                                material={m}
                                onPreview={() => setPreviewItem(m)}
                                onDelete={() => setDeleteItem(m)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {uploadOpen && (
                <UploadModal onClose={() => setUploadOpen(false)} onUpload={handleUpload} />
            )}
            {previewItem && (
                <PreviewModal material={previewItem} onClose={() => setPreviewItem(null)} />
            )}
            {deleteItem && (
                <DeleteConfirm
                    name={deleteItem.name}
                    onClose={() => setDeleteItem(null)}
                    onConfirm={() => handleDelete(deleteItem.id)}
                />
            )}
        </div>
    );
}