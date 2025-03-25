"use client"

import { useState, useRef } from "react"
import { Stage, Layer, Text, Image, Transformer } from "react-konva"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Upload } from "lucide-react"

const GlassesMaker = () => {
  const [image, setImage] = useState(null)
  const [glasses, setGlasses] = useState("😎")
  const [glassesProps, setGlassesProps] = useState({
    x: 160,
    y: 120,
    fontSize: 50,
    rotation: 0,
    draggable: true,
  })
  const [selectedId, setSelectedId] = useState(null)
  const stageRef = useRef(null)
  const textRef = useRef(null)
  const transformerRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.src = event.target.result
      img.onload = () => setImage(img)
    }
    reader.readAsDataURL(file)
  }

  const handleGlassesChange = (e) => {
    setGlasses(e.target.value)
  }

  const handleDownload = () => {
    if (!stageRef.current) return

    // Temporarily hide the transformer
    const transformer = transformerRef.current
    if (transformer) {
      transformer.visible(false)
    }

    // Get the data URL and download
    const dataURL = stageRef.current.toDataURL()

    // Restore transformer visibility
    if (transformer) {
      transformer.visible(true)
    }

    // Create download link
    const link = document.createElement("a")
    link.download = "custom-glasses-photo.png"
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSizeChange = (value) => {
    setGlassesProps({
      ...glassesProps,
      fontSize: value[0],
    })
  }

  const handleRotationChange = (value) => {
    setGlassesProps({
      ...glassesProps,
      rotation: value[0],
    })
  }

  const checkDeselect = (e) => {
    // Clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      setSelectedId(null)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-600 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Custom Glasses Maker</h1>
      <p className="text-lg mb-4">Upload your photo and add glasses.</p>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        <div className="flex-1">
          <Card className="bg-pink-700 border-pink-500">
            <CardContent className="p-4">
              <div className="mb-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 transition-colors p-2 rounded-md">
                    <Upload size={16} />
                    <span>Upload Photo</span>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </div>

              <div className="mb-4">
                <label className="block mb-2">Choose Glasses Style:</label>
                <div className="grid grid-cols-5 gap-2 text-3xl">
                  {["😎", "🕶️", "👓", "🥽", "🤓"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setGlasses(emoji)}
                      className={`p-2 rounded-md ${glasses === emoji ? "bg-pink-400" : "bg-pink-500 hover:bg-pink-400"}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2">Size:</label>
                <Slider
                  defaultValue={[glassesProps.fontSize]}
                  max={100}
                  min={10}
                  step={1}
                  onValueChange={handleSizeChange}
                  className="py-4"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Rotation:</label>
                <Slider
                  defaultValue={[glassesProps.rotation]}
                  max={360}
                  min={0}
                  step={1}
                  onValueChange={handleRotationChange}
                  className="py-4"
                />
              </div>

              <Button
                onClick={handleDownload}
                className="w-full bg-pink-500 hover:bg-pink-400 text-white"
                disabled={!image}
              >
                <Download size={16} className="mr-2" />
                Download Image
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <div className="w-full max-w-[320px] h-[320px] bg-pink-400 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
            <Stage width={320} height={320} ref={stageRef} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
              <Layer>
                {image && <Image image={image} width={320} height={320} x={0} y={0} fit="cover" />}
                <Text
                  text={glasses}
                  x={glassesProps.x}
                  y={glassesProps.y}
                  fontSize={glassesProps.fontSize}
                  rotation={glassesProps.rotation}
                  draggable={glassesProps.draggable}
                  ref={textRef}
                  onClick={() => setSelectedId("glasses")}
                  onTap={() => setSelectedId("glasses")}
                  onDragEnd={(e) => {
                    setGlassesProps({
                      ...glassesProps,
                      x: e.target.x(),
                      y: e.target.y(),
                    })
                  }}
                />
                {selectedId === "glasses" && (
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      // Limit resize
                      if (newBox.width < 10 || newBox.height < 10) {
                        return oldBox
                      }
                      return newBox
                    }}
                    onTransformEnd={() => {
                      // Get transformer node
                      const node = textRef.current
                      if (!node) return

                      // Get the new scale
                      const scaleX = node.scaleX()

                      // Update font size based on scale
                      const newFontSize = glassesProps.fontSize * scaleX

                      // Reset scale and update font size
                      node.scaleX(1)
                      node.scaleY(1)

                      setGlassesProps({
                        ...glassesProps,
                        fontSize: newFontSize,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                      })
                    }}
                  />
                )}
              </Layer>
            </Stage>
          </div>
          <p className="text-center mt-4 text-pink-200">
            {image ? "Drag the glasses to position them on your photo" : "Upload a photo to get started"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default GlassesMaker

