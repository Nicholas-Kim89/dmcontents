import { 
  MousePointer2, 
  Brush, 
  LassoSelect, 
  Eraser, 
  Type, 
  Layers,
  Image as ImageIcon,
  Sparkles,
  Search,
  Check,
  Loader2,
  ChevronRight,
  History,
  GitCompare,
  ArrowRight,
  Download,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  Plus,
  Maximize2,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'
import { fabric } from 'fabric'

const models = [
  { id: 'gemini-3.1-flash-image-preview', name: 'Nano Banana 2', desc: '고효율 및 속도 최적화 모델 (유료 티어 권장)', type: 'Gemini', maxResolution: '4K' },
  { id: 'gemini-3-pro-image-preview', name: 'Nano Banana Pro', desc: '전문 애셋용. 사고 과정을 거쳐 복잡한 지시 수행', hasSearch: true, type: 'Gemini', maxResolution: '4K' },
  { id: 'gemini-2.5-flash-image', name: 'Nano Banana', desc: '대량 작업 및 저지연 속도 최적화', type: 'Gemini', maxResolution: '2K' },
  { id: 'imagen-4.0-ultra-generate-001', name: 'Imagen 4.0 Ultra', desc: '최고 해상도 및 고화질 전문가용', type: 'Imagen', maxResolution: '2K' },
  { id: 'imagen-4.0-generate-001', name: 'Imagen 4.0 Standard', desc: '균형 잡힌 고품질 이미지 생성', type: 'Imagen', maxResolution: '2K' },
]

const resolutions = ['512', '1K', '2K', '4K']
const geminiAspectRatios = ['1:1', '16:9', '9:16', '21:9', '2:3', '3:2', '4:5', '5:4', '1:4', '4:1']
const imagenAspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4']

interface CreativeStudioProps {
  project: { id: string, name: string } | null;
  incomingImage?: { url?: string | null, prompt?: string | null, text?: string | null } | null;
  clearIncomingImage?: () => void;
}

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-surface-container text-on-surface p-10 text-center gap-4">
          <Sparkles size={48} className="text-primary opacity-20" />
          <h2 className="text-xl font-bold">Something went wrong in the Studio</h2>
          <p className="text-sm text-on-surface-variant max-w-md">
            The studio encountered a rendering error. This can happen during complex image transitions.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-on-primary rounded-xl font-bold"
          >
            Reload Studio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import React from 'react'

export function CreativeStudio({ project, incomingImage, clearIncomingImage }: CreativeStudioProps) {
  const [activeTool, setActiveTool] = useState('select')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [selectedModel, setSelectedModel] = useState(models[1])
  const [resolution, setResolution] = useState('1K')
  const [prompt, setPrompt] = useState('')
  const [useSearch, setUseSearch] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Image States
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isEditingBase, setIsEditingBase] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])

  // Multi-slot States
  const [slotCount, setSlotCount] = useState(1)
  const [slotImages, setSlotImages] = useState<(string | null)[]>([null, null, null, null])
  const [activeSlotIndex, setActiveSlotIndex] = useState(0)
  const [generatingSlots, setGeneratingSlots] = useState<Set<number>>(new Set())

  // Fabric Canvas States
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [isFabricReady, setIsFabricReady] = useState(false)
  const [canvasScale, setCanvasScale] = useState(1)

  // Initialize Fabric Canvas using a Callback Ref to ensure perfect DOM timing
  const initFabricOnMount = useCallback((container: HTMLDivElement | null) => {
    canvasContainerRef.current = container;
    
    // Cleanup if unmounting
    if (!container) {
      if (fabricCanvasRef.current) {
        try { fabricCanvasRef.current.dispose(); } catch (_) {}
        fabricCanvasRef.current = null;
      }
      setIsFabricReady(false);
      return;
    }

    // Initialize if mounting
    if (fabricCanvasRef.current) return;

    // Clean up any leftover DOM
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Create canvas element manually - keeps it outside React's vdom
    const canvasEl = document.createElement('canvas');
    container.appendChild(canvasEl);

    const canvas = new fabric.Canvas(canvasEl, {
      isDrawingMode: false,
      selection: true,
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = canvas;
    setIsFabricReady(true);
  }, []);

  const prevProjectIdRef = useRef<string | undefined>(project?.id)
  useEffect(() => {
    if (project?.id && project.id !== prevProjectIdRef.current) {
      setSlotImages([null, null, null, null])
      setGeneratedImage(null)
      setHistory([])
      setCompareMode(false)
      setIsEditingBase(false)
      setPrompt('')
      setSelectedAssets([])
      clearCanvas()
      prevProjectIdRef.current = project.id
    }
  }, [project?.id])

  useEffect(() => {
    if (incomingImage) {
      if (incomingImage.url) {
        setSlotImages(prev => {
          const next = [...prev];
          next[activeSlotIndex] = incomingImage.url!;
          return next;
        });
        setGeneratedImage(incomingImage.url)
        if (incomingImage.prompt) setPrompt(incomingImage.prompt)
        setCompareMode(false)
        setIsEditingBase(true)
        clearCanvas()
      }

      // If text is provided, add it to the canvas once fabric is ready
      if (incomingImage.text && isFabricReady) {
        const canvas = fabricCanvasRef.current
        if (canvas) {
          // Determine position (center top)
          const canvasWidth = canvas.width || 800
          
          const text = new fabric.IText(incomingImage.text, {
            left: canvasWidth / 2,
            top: 100,
            originX: 'center',
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1,
            fontSize: 42,
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            width: Math.min(canvasWidth * 0.8, 600),
            splitByGrapheme: true // Word wrap for long text
          })
          
          // Wait a bit for image to load before adding text if possible, 
          // or just add it now.
          canvas.add(text)
          canvas.setActiveObject(text)
          canvas.renderAll()
          setIsEditingBase(true)
        }
      }

      clearIncomingImage?.()
    }
  }, [incomingImage, activeSlotIndex, clearIncomingImage, isFabricReady])

  // Sync canvas size with image size via Zoom
  useEffect(() => {
    const resizeCanvas = () => {
      const wrapper = canvasContainerRef.current
      const canvas = fabricCanvasRef.current
      if (!wrapper || !canvas || !generatedImage) return

      const img = new window.Image()
      img.src = generatedImage
      img.onload = () => {
        const imgW = img.width || 800
        const imgH = img.height || 800

        const wrapperW = wrapper.clientWidth
        const wrapperH = wrapper.clientHeight

        const scale = Math.max(Math.min(wrapperW / imgW, wrapperH / imgH) * 0.95, 0.05) // Prevent scale from being 0
        setCanvasScale(scale)

        canvas.setWidth(imgW * scale)
        canvas.setHeight(imgH * scale)
        canvas.setZoom(scale)

        fabric.Image.fromURL(generatedImage, (fimg) => {
          canvas.setBackgroundImage(fimg, canvas.renderAll.bind(canvas))
        }, { crossOrigin: 'anonymous' })
      }
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [generatedImage, isFabricReady, isEditingBase])

  const clearCanvas = () => {
    const canvas = fabricCanvasRef.current
    if (canvas) {
      canvas.clear()
      if (generatedImage) {
        fabric.Image.fromURL(generatedImage, (fimg) => {
          canvas.setBackgroundImage(fimg, canvas.renderAll.bind(canvas))
        }, { crossOrigin: 'anonymous' })
      }
    }
  }

  // Handle Tool Changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    canvas.isDrawingMode = false
    canvas.selection = false
    canvas.forEachObject(obj => {
      obj.selectable = false
      obj.evented = false
    })

    if (activeTool === 'select') {
      canvas.selection = true
      canvas.forEachObject(obj => {
        obj.selectable = true
        obj.evented = true
      })
    } else if (activeTool === 'brush') {
      canvas.isDrawingMode = true
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = 'rgba(255, 50, 50, 0.5)'
      canvas.freeDrawingBrush.width = 20
    } else if (activeTool === 'lasso') {
      canvas.isDrawingMode = true
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = 'rgba(0, 255, 100, 0.5)'
      canvas.freeDrawingBrush.width = 2
    } else if (activeTool === 'eraser') {
      canvas.selection = true
      canvas.forEachObject(obj => {
        obj.selectable = true
        obj.evented = true
      })
    }
    
    // Disable interaction if not in edit mode
    if (!isEditingBase) {
      canvas.isDrawingMode = false
      canvas.selection = false
      canvas.forEachObject(obj => {
        obj.selectable = false
        obj.evented = false
      })
    }
    
    canvas.renderAll()
  }, [activeTool, isFabricReady, isEditingBase])

  // Handle Text Insertion & Eraser
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const handleMouseDown = (opt: fabric.IEvent) => {
      if (!isEditingBase) return
      
      if (activeTool === 'text') {
        const pointer = canvas.getPointer(opt.e)
        // Adjust for zoom when placing object manually
        const text = new fabric.IText('Type here...', {
          left: pointer.x,
          top: pointer.y,
          fill: 'white',
          stroke: 'black',
          strokeWidth: 1,
          fontSize: 40,
          fontWeight: 'bold',
          fontFamily: 'sans-serif'
        })
        canvas.add(text)
        canvas.setActiveObject(text)
        text.enterEditing()
        text.selectAll()
        setActiveTool('select') 
      } else if (activeTool === 'eraser') {
        if (opt.target) {
          canvas.remove(opt.target)
          canvas.discardActiveObject()
        }
      }
    }

    const handlePathCreated = (opt: any) => {
      if (!isEditingBase) return
      if (activeTool === 'lasso' && opt.path) {
        opt.path.set({ fill: 'rgba(0, 255, 100, 0.3)', stroke: 'rgba(0, 255, 100, 0.8)' })
        canvas.renderAll()
      }
    }

    canvas.on('mouse:down', handleMouseDown)
    canvas.on('path:created', handlePathCreated)

    return () => {
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('path:created', handlePathCreated)
    }
  }, [activeTool, isFabricReady, isEditingBase])

  // Keybindings (Delete object)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditingBase) return
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const canvas = fabricCanvasRef.current
        if (!canvas) return
        
        // Do not delete if editing text
        if (canvas.getActiveObject()?.type === 'i-text' && (canvas.getActiveObject() as fabric.IText).isEditing) {
          return
        }
        
        const activeObjects = canvas.getActiveObjects()
        if (activeObjects.length) {
          canvas.discardActiveObject()
          activeObjects.forEach(obj => canvas.remove(obj))
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditingBase])

  const addLayerToCanvas = (url: string) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    fabric.Image.fromURL(url, (img) => {
      const canvasWidth = canvas.width || 800
      const canvasHeight = canvas.height || 800
      
      // Initial scale: fit to 50% of canvas
      const scale = Math.min(canvasWidth / img.width!, canvasHeight / img.height!) * 0.5
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - img.width! * scale) / 2,
        top: (canvasHeight - img.height! * scale) / 2,
        cornerColor: '#3d5afe',
        cornerStyle: 'circle',
        transparentCorners: false,
        cornerSize: 10,
      })

      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
      setIsEditingBase(true)
    }, { crossOrigin: 'anonymous' })
  }

  const handleInternalDragStart = (e: React.DragEvent, url: string) => {
    e.dataTransfer.setData('text/plain', url)
    e.dataTransfer.effectAllowed = 'copyMove'
  }

  // Sync generatedImage with the active slot's image
  useEffect(() => {
    const currentSlotImage = slotImages[activeSlotIndex] || null;
    if (currentSlotImage !== generatedImage) {
      setGeneratedImage(currentSlotImage);
    }
  }, [activeSlotIndex, slotImages[activeSlotIndex]]);

  // Drag and Drop Images onto Canvas
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, slotIndex?: number) => {
    e.preventDefault();
    
    const targetIndex = slotIndex !== undefined ? slotIndex : activeSlotIndex;
    const internalUrl = e.dataTransfer.getData('text/plain');

    // Case 1: Internal Drag from another slot/history
    if (internalUrl && internalUrl.startsWith('data:image')) {
      if (targetIndex === activeSlotIndex && generatedImage) {
        // Dragging into the ACTIVE slot: Add as a new layer
        addLayerToCanvas(internalUrl);
      } else {
        // Dragging into an INACTIVE slot: Replace image
        setSlotImages(prev => {
          const next = [...prev];
          next[targetIndex] = internalUrl;
          return next;
        });
        if (targetIndex === activeSlotIndex) {
          setGeneratedImage(internalUrl);
        }
      }
      return;
    }

    // Case 2: External File Drop
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      if (!data) return;

      if (targetIndex === activeSlotIndex && generatedImage) {
        // Drop file into active slot: Add as layer
        addLayerToCanvas(data);
      } else {
        // Drop file into inactive/empty slot: Set as background
        setSlotImages(prev => {
          const next = [...prev];
          next[targetIndex] = data;
          return next;
        });
        if (targetIndex === activeSlotIndex) {
          setGeneratedImage(data);
        }
      }
    };
    reader.readAsDataURL(files[0]);
  }

  const getMergedImage = (): string | null => {
    if (!generatedImage || !fabricCanvasRef.current) return generatedImage
    // Export full resolution using multiplier, but cap it to prevent browser OOM crashes
    const safeScale = canvasScale > 0.05 ? canvasScale : 1
    const safeMultiplier = Math.min(1 / safeScale, 8) // Cap multiplier at 8x to avoid memory crashes
    
    try {
      return fabricCanvasRef.current.toDataURL({ 
        format: 'png', 
        quality: 1, 
        multiplier: safeMultiplier 
      })
    } catch (e) {
      console.error("Failed to extract canvas image data:", e)
      return generatedImage
    }
  }

  const handleGenerate = async () => {
    if (!prompt) return
    
    const targetSlots = slotCount > 1 ? Array.from({ length: slotCount }, (_, i) => i) : [activeSlotIndex];
    setGeneratingSlots(new Set(targetSlots));
    setIsGenerating(true)
    
    const previousImage = generatedImage
    const finalBaseImage = isEditingBase ? getMergedImage() : null

    // Force full-bleed UI for web/landing page prompts
    let basePrompt = prompt;
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('랜딩') || lowerPrompt.includes('웹') || lowerPrompt.includes('ui') || lowerPrompt.includes('앱')) {
      basePrompt += " IMPORTANT: Generate FULL-BLEED UI only. Do NOT include device frames, mockups, monitors, or any background environments. The UI interface must fill the entire image exactly edge-to-edge.";
    }

    try {
      let slotPrompts = [basePrompt];
      if (slotCount > 1) {
        try {
          const varRes = await fetch('/prompt/variations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: basePrompt, count: slotCount - 1 })
          });
          if (varRes.ok) {
            const varData = await varRes.json();
            const validVariations = (varData.variations || []).filter((v: any) => typeof v === 'string' && v.length > 0);
            slotPrompts = [basePrompt, ...validVariations];
          }
        } catch (e) {
          console.error("Variation brainstorming failed", e);
        }
      }

      await Promise.all(targetSlots.map(async (idx) => {
        const currentPrompt = slotPrompts[idx] || basePrompt;
        
        try {
          const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: selectedModel.id,
              prompt: currentPrompt,
              aspect_ratio: aspectRatio,
              image_size: resolution,
              use_search: useSearch && selectedModel.hasSearch,
              base_image: idx === activeSlotIndex ? finalBaseImage : null,
              project_id: project?.id
            })
          })
          
          if (!response.ok) throw new Error('Generation failed');

          const data = await response.json()
          if (data.image) {
            setSlotImages(prev => {
              const next = [...prev];
              next[idx] = data.image;
              return next;
            });
            if (idx === activeSlotIndex) {
              setGeneratedImage(data.image);
              if (previousImage && typeof previousImage === 'string') {
                setHistory(prevH => [previousImage, ...prevH].filter(img => !!img && typeof img === 'string').filter((v, i, a) => a.indexOf(v) === i).slice(0, 20))
              }
            }
          }
        } catch (err) {
          console.error(`Slot ${idx} failed`, err);
        } finally {
          setGeneratingSlots(prev => {
            const next = new Set(prev);
            next.delete(idx);
            return next;
          });
        }
      }));
    } catch (error: any) {
      console.error(error)
    } finally {
      setIsGenerating(false)
      setGeneratingSlots(new Set())
      // Do NOT setIsEditingBase(true) here - let user explicitly enter edit mode
    }
  }

  const handleDeleteHistory = (index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index))
  }

  const toggleAssetSelection = (img: string) => {
    setSelectedAssets(prev => 
      prev.includes(img) ? prev.filter(a => a !== img) : [...prev, img]
    )
  }

  const handleEditFromCompare = (img: string) => {
    if (generatedImage && generatedImage !== img) {
      setHistory(prev => {
        const updatedHistory = [generatedImage, ...prev].filter(h => h !== img);
        return updatedHistory.filter((v, i, a) => a.indexOf(v) === i).slice(0, 20);
      });
    }
    
    setSlotImages(prev => {
      const next = [...prev];
      next[activeSlotIndex] = img;
      return next;
    });
    
    setCompareMode(false)
    setIsEditingBase(true)
    clearCanvas()
  }

  const downloadAssets = () => {
    selectedAssets.forEach((url, idx) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = url
        link.download = `asset-${project?.name || 'export'}-${Date.now()}-${idx}.png`
        link.click()
      }, idx * 200)
    })
  }

  const availableResolutions = resolutions.filter(res => {
    if (selectedModel.maxResolution === '4K') return true
    if (selectedModel.maxResolution === '2K') return res !== '4K'
    return res === '512' || res === '1K'
  })

  const currentAspectRatios = selectedModel.type === 'Gemini' ? geminiAspectRatios : imagenAspectRatios

  return (
    <ErrorBoundary>
    <div 
      className="flex-1 flex overflow-hidden bg-surface-container-lowest"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
    >
      {/* Left Toolbar */}
      <div className="w-16 bg-surface-container border-r border-white/5 flex flex-col items-center py-6 gap-3 shrink-0 z-30 shadow-xl">
        <ToolButton icon={<MousePointer2 size={20} />} label="Select" active={activeTool === 'select'} onClick={() => setActiveTool('select')} />
        <div className="w-8 h-px bg-white/10 my-1" />
        <ToolButton icon={<Brush size={20} />} label="Brush (Inpaint)" active={activeTool === 'brush'} onClick={() => setActiveTool('brush')} />
        <ToolButton icon={<LassoSelect size={20} />} label="Lasso" active={activeTool === 'lasso'} onClick={() => setActiveTool('lasso')} />
        <ToolButton icon={<Eraser size={20} />} label="Eraser" active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} />
        <ToolButton icon={<Type size={20} />} label="Text" active={activeTool === 'text'} onClick={() => setActiveTool('text')} />
        
        <div className="mt-auto flex flex-col gap-3">
          <ToolButton 
            icon={<History size={20} />} 
            label="History" 
            active={activeTool === 'history'} 
            onClick={() => setActiveTool(activeTool === 'history' ? 'select' : 'history')} 
          />
          <ToolButton icon={<Layers size={20} />} label="Layers" active={activeTool === 'layers'} onClick={() => setActiveTool('layers')} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header / Mode Switcher */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-surface-container/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
              {project ? project.name : 'No Project Selected'}
            </span>
            <div className="flex bg-surface-container-highest p-1 rounded-lg">
              <button 
                onClick={() => setCompareMode(false)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${!compareMode ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Canvas
              </button>
              <button 
                onClick={() => setCompareMode(true)}
                disabled={!history.length && !generatedImage}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${compareMode ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface disabled:opacity-30'}`}
              >
                Compare Versions
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedAssets.length > 0 && (
              <button 
                onClick={downloadAssets}
                className="px-4 py-1.5 rounded-lg bg-accent text-on-accent text-xs font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Download size={14} />
                Save {selectedAssets.length} Assets
              </button>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative flex flex-col items-center justify-center bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] p-6 pb-24 overflow-hidden">
          <AnimatePresence mode="wait">
            {isEditingBase ? (
              <motion.div
                key="workspace-mode"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-full flex flex-col gap-4 relative max-w-6xl max-h-[80vh]"
              >
                {/* Master Canvas */}
                <div className="flex-1 w-full bg-surface-container-high rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative flex items-center justify-center"
                     onDrop={(e) => handleDrop(e, activeSlotIndex)}
                     onDragOver={handleDragOver}>
                  <div ref={initFabricOnMount} className="w-full h-full flex items-center justify-center" />
                  
                  {/* Overlay Tools inside canvas */}
                  <div className="absolute top-4 left-4 bg-accent px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl border border-white/20">
                    <Edit3 size={14} className="text-on-accent" />
                    <span className="text-xs font-bold text-on-accent uppercase tracking-widest">Workspace: Slot {activeSlotIndex + 1}</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      const merged = getMergedImage();
                      if (merged) {
                        setSlotImages(prev => {
                           const next = [...prev];
                           next[activeSlotIndex] = merged;
                           return next;
                        });
                        setGeneratedImage(merged);
                      }
                      setIsEditingBase(false);
                    }}
                    className="absolute top-4 right-4 bg-primary text-on-primary px-6 py-2 rounded-xl font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2 z-50"
                  >
                    <CheckSquare size={16} />
                    Save & Close
                  </button>

                  <button
                    onClick={() => setIsEditingBase(false)}
                    className="absolute bottom-4 right-4 bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:text-white transition-colors z-50"
                  >
                    Discard Changes
                  </button>
                </div>
                
                {/* Asset Dock (Thumbnails) */}
                {slotCount > 1 && (
                  <div className="h-24 shrink-0 bg-surface-container/80 backdrop-blur-md rounded-2xl border border-white/10 p-3 flex items-center gap-4 overflow-x-auto shadow-lg">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest shrink-0 px-2">Asset Dock</span>
                    {slotImages.map((img, idx) => {
                      if (idx >= slotCount) return null;
                      if (idx === activeSlotIndex) return null; // Don't show the master slot itself
                      
                      return (
                        <div
                          key={idx}
                          className="h-full aspect-square rounded-xl overflow-hidden border-2 border-white/10 hover:border-primary/50 transition-colors relative group bg-surface-container-highest cursor-grab active:cursor-grabbing shrink-0"
                          draggable={!!img}
                          onDragStart={(e) => img && handleInternalDragStart(e, img)}
                        >
                          {img ? (
                            <img src={img} className="w-full h-full object-cover" alt={`Slot ${idx + 1}`} />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white/20">
                              <span className="text-[10px] font-bold">EMPTY</span>
                            </div>
                          )}
                          {img && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                              <Plus size={16} className="text-white" />
                              <span className="text-[9px] font-bold text-white text-center px-1 uppercase tracking-wider">Drag to Canvas</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            ) : !compareMode ? (
              <motion.div 
                key="canvas-grid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className={`grid gap-4 w-full h-full max-w-5xl max-h-[75vh] ${
                  slotCount === 1 ? 'grid-cols-1' : 
                  slotCount === 2 ? 'grid-cols-2' : 
                  slotCount === 3 ? 'grid-cols-1 grid-rows-3' : 
                  'grid-cols-2 grid-rows-2'
                }`}
              >
                {Array.from({ length: slotCount }).map((_, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (activeSlotIndex !== idx) {
                        setActiveSlotIndex(idx);
                        setIsEditingBase(false);
                      }
                    }}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragOver={handleDragOver}
                    className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-500 flex items-center justify-center group cursor-pointer ${
                      activeSlotIndex === idx ? 'border-primary ring-4 ring-primary/20 shadow-2xl scale-[1.02] z-10' : 'border-white/10 hover:border-white/30 bg-surface-container-high'
                    }`}
                  >
                    <div 
                      className={`w-full h-full relative ${generatingSlots.has(idx) ? 'blur-md' : ''}`}
                      draggable={!!slotImages[idx]}
                      onDragStart={(e) => slotImages[idx] && handleInternalDragStart(e, slotImages[idx]!)}
                    >
                      {slotImages[idx] ? (
                        <img src={slotImages[idx]!} className="w-full h-full object-cover" alt={`Slot ${idx}`} />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10 gap-2">
                           <ImageIcon size={24} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Slot {idx + 1}</span>
                        </div>
                      )}

                      {!generatingSlots.has(idx) && slotImages[idx] && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSlotIndex(idx);
                              setIsEditingBase(true);
                            }}
                            className="px-6 py-3 bg-primary text-on-primary rounded-2xl text-[12px] font-bold shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
                          >
                            <Edit3 size={16} />
                            OPEN WORKSPACE
                          </button>
                        </div>
                      )}

                      {!generatingSlots.has(idx) && !slotImages[idx] && activeSlotIndex !== idx && (
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-black/60 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase">Switch to Slot {idx + 1}</span>
                        </div>
                      )}
                    </div>

                    {activeSlotIndex === idx && generatedImage && !generatingSlots.has(idx) && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleAssetSelection(generatedImage); }}
                        className="absolute top-4 right-4 bg-black/50 p-2 rounded-xl text-white hover:bg-black/80 transition-all z-40 shadow-lg backdrop-blur-md"
                      >
                        {selectedAssets.includes(generatedImage) ? <CheckSquare className="text-primary" size={20} /> : <Square size={20} />}
                      </button>
                    )}

                    {/* Unified Stable Overlay for Generating Slots */}
                    <div className={`absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50 transition-all duration-500 ${generatingSlots.has(idx) ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                      <Loader2 size={32} className="text-primary animate-spin mb-4" />
                      <span className="text-[10px] font-bold text-primary animate-pulse tracking-widest uppercase">
                        {idx === activeSlotIndex ? "Generating Master..." : `Generating Variation ${idx + 1}...`}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="compare"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full p-4 mb-12 overflow-y-auto custom-scrollbar"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 content-start">
                  {(() => {
                    const allUniqueImages = Array.from(new Set([
                      ...slotImages.filter((img): img is string => !!img),
                      ...(generatedImage ? [generatedImage] : []),
                      ...history
                    ]));
                    return allUniqueImages.map((img, idx) => {
                      const isCurrentBase = img === generatedImage;
                      const isFromSlots = slotImages.includes(img) && img !== generatedImage;
                      let label = `Version ${idx}`;
                      if (isCurrentBase) label = 'Current Base';
                      else if (isFromSlots) {
                        const slotIdx = slotImages.indexOf(img);
                        label = `Slot ${slotIdx + 1} Variation`;
                      }
                      return (
                        <div key={idx} className="relative group flex flex-col gap-2">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                              {label}
                            </span>
                          </div>
                          <div 
                            className="rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary/50 shadow-lg bg-surface-container-high relative aspect-square cursor-pointer transition-all hover:scale-[1.02]"
                            onClick={() => handleEditFromCompare(img)}
                            title="Click to Edit this version"
                          >
                            <img src={img} className="w-full h-full object-cover" alt={label} />
                            
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditFromCompare(img) }}
                                className="bg-primary hover:bg-primary-hover text-on-primary p-2.5 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                                title="Edit this version"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setPreviewImage(img) }}
                                className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all border border-white/10"
                                title="Preview original size & aspect ratio"
                              >
                                <Maximize2 size={16} />
                              </button>
                            </div>

                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleAssetSelection(img) }}
                              className="absolute top-3 right-3 bg-black/50 p-1.5 rounded-lg text-white hover:bg-black/80 transition-all z-10"
                            >
                              {selectedAssets.includes(img) ? <CheckSquare className="text-primary" size={20} /> : <Square size={20} />}
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Prompt Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-40">
            <motion.div 
              layout
              className="glass p-2 rounded-2xl flex flex-col gap-2 shadow-2xl border border-white/10 focus-within:border-primary/40 transition-all bg-surface-container/80"
            >
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setIsEditingBase(!isEditingBase)
                    clearCanvas()
                  }}
                  disabled={!generatedImage || selectedModel.type === 'Imagen'}
                  className={`w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center transition-all ${isEditingBase ? 'bg-accent text-on-accent' : 'bg-surface-container-highest text-on-surface-variant hover:text-primary disabled:opacity-20'}`}
                  title={selectedModel.type === 'Imagen' ? 'Imagen does not support editing mode' : 'Edit current image'}
                >
                  <Edit3 size={20} />
                  <span className="text-[7px] font-bold mt-0.5 uppercase">Edit</span>
                </button>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
                  className="flex-1 bg-surface-container-lowest/50 rounded-xl border-none focus:ring-0 text-on-surface text-sm py-3 px-4 resize-none h-12 max-h-32 transition-all disabled:opacity-50"
                  placeholder={isEditingBase ? "What modification should I make to this image? (You can also draw/write on the canvas)" : `Describe what you want to generate with ${selectedModel.name}...`}
                />
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className="h-12 px-6 rounded-xl bg-gradient-to-br from-primary to-accent text-on-primary font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  Generate
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-surface-container border-l border-white/5 flex flex-col shrink-0 z-30 shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="p-4 border-b border-white/5 sticky top-0 bg-surface-container/90 backdrop-blur-md z-10 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
            {activeTool === 'history' ? 'Version History' : 'Studio Settings'}
          </h3>
          {activeTool === 'history' && (
            <button onClick={() => setActiveTool('select')} className="text-on-surface-variant hover:text-on-surface">
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTool === 'history' ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4 space-y-4">
                {!history.length && (
                  <div className="py-20 text-center text-on-surface-variant/40 space-y-4">
                    <History size={48} className="mx-auto opacity-20" />
                    <p className="text-xs italic">No generation history yet</p>
                  </div>
                )}
                {history.map((img, idx) => (
                  <div key={idx} className="group relative rounded-xl overflow-hidden aspect-video border border-white/5 hover:border-primary/50 transition-all shadow-md">
                    <img src={img} className="w-full h-full object-cover" alt={`Version ${idx}`} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                      <button onClick={() => handleEditFromCompare(img)} title="Edit this version" className="p-2 rounded-lg bg-primary text-on-primary hover:scale-110 transition-transform"><Edit3 size={16} /></button>
                      <button onClick={() => setPreviewImage(img)} title="Preview full size" className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 hover:scale-110 transition-transform border border-white/10"><Maximize2 size={16} /></button>
                      <button onClick={() => handleDeleteHistory(idx)} className="p-2 rounded-lg bg-error/20 text-error hover:bg-error/40 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 space-y-6">
                <section className="space-y-3">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Canvas Layout</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(num => (
                      <button 
                        key={num} 
                        onClick={() => {
                          setSlotCount(num);
                          if (activeSlotIndex >= num) setActiveSlotIndex(0);
                        }} 
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${slotCount === num ? 'bg-primary/20 border-primary text-primary shadow-sm' : 'bg-surface-container-lowest border-white/5 text-on-surface-variant hover:border-white/20'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Engine</label>
                  <div className="relative">
                    <select value={selectedModel.id} onChange={(e) => setSelectedModel(models.find(m => m.id === e.target.value) || models[0])} className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-primary hover:bg-surface-container-high transition-all">
                      {models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                    </select>
                  </div>
                </section>
                <section className="space-y-3">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Resolution</label>
                  <div className="grid grid-cols-2 gap-2">
                    {resolutions.map(res => (
                      <button key={res} disabled={!availableResolutions.includes(res)} onClick={() => setResolution(res)} className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${resolution === res ? 'bg-primary/20 border-primary text-primary shadow-sm' : 'bg-surface-container-lowest border-white/5 text-on-surface-variant disabled:opacity-20 hover:border-white/20'}`}>{res}</button>
                    ))}
                  </div>
                </section>
                <section className="space-y-3">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {currentAspectRatios.map(ratio => (
                      <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${aspectRatio === ratio ? 'bg-primary/20 border-primary text-primary shadow-sm' : 'bg-surface-container-lowest border-white/5 text-on-surface-variant hover:border-white/20'}`}>{ratio}</button>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

    {/* High-Fidelity Original Aspect Ratio & Size Preview Modal */}
    <AnimatePresence>
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 cursor-zoom-out select-none"
        >
          {/* Close Button */}
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-all cursor-pointer z-50 border border-white/10 hover:rotate-90 duration-300"
            title="Close Preview"
          >
            <X size={20} />
          </button>

          {/* Image Container with Original Aspect Ratio */}
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[90%] max-h-[80%] flex items-center justify-center bg-surface-container-highest/20 rounded-2xl p-2 border border-white/10 shadow-2xl overflow-hidden"
          >
            <img
              src={previewImage}
              alt="High-Fidelity Original Resolution Preview"
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
            />
          </motion.div>

          {/* Bottom Meta Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="mt-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-6 text-xs text-on-surface-variant font-bold shadow-xl animate-in fade-in-50 duration-300"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Original Resolution
            </span>
            <div className="w-[1px] h-3 bg-white/10" />
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = previewImage;
                link.download = `preview-${project?.name || 'export'}-${Date.now()}.png`;
                link.click();
              }}
              className="text-primary hover:text-primary-hover flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={14} />
              Download Original
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </ErrorBoundary>
  )
}

function ToolButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-12 h-12 rounded-xl flex items-center justify-center relative group transition-all duration-200 ${active ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}>
      {icon}
      <div className="absolute left-16 bg-surface-container-highest text-on-surface px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/5">{label}</div>
    </button>
  )
}
