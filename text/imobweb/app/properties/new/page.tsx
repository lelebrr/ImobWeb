'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Save,
    Camera,
    Sparkles,
    MapPin,
    DollarSign,
    Home,
    Building,
    CheckCircle2,
    Loader2,
    Plus,
    X,
    Image as ImageIcon,
    FileText,
    Globe
} from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Input } from '@/components/design-system/input'
import { Label } from '@/components/design-system/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/design-system/card'
import { Badge } from '@/components/design-system/badge'
import { RadioGroup, RadioGroupItem } from '@/components/design-system/radio-group'
import { Textarea } from '@/components/design-system/textarea'
import { useAI } from '@/providers'
import { PropertyType, BusinessType } from '@prisma/client'

/**
 * Página de Cadastro de Imóvel com IA
 * Permite cadastro inteligente com preenchimento automático via IA
 */
export default function NewPropertyPage() {
    const router = useRouter()
    const { generateDescription, suggestPrice } = useAI()

    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: PropertyType.APARTAMENTO,
        businessType: BusinessType.VENDA,
        price: '',
        area: '',
        bedrooms: '',
        bathrooms: '',
        garages: '',
        city: '',
        state: '',
        neighborhood: '',
    })

    const [photos, setPhotos] = useState<File[]>([])
    const [aiSuggestions, setAiSuggestions] = useState<{
        description?: string
        suggestedPrice?: number
        title?: string
    }>({})

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleGenerateTitle = async () => {
        if (!formData.description) {
            alert('Por favor, adicione uma descrição primeiro')
            return
        }

        setAiLoading(true)
        try {
            const response = await fetch('/api/ai/generate-title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: formData.description,
                    type: formData.type,
                    city: formData.city,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setFormData(prev => ({ ...prev, title: data.title }))
            }
        } catch (error) {
            console.error('Erro ao gerar título:', error)
        } finally {
            setAiLoading(false)
        }
    }

    const handleGenerateDescription = async () => {
        setAiLoading(true)
        try {
            const response = await fetch('/api/ai/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: formData.type,
                    businessType: formData.businessType,
                    bedrooms: formData.bedrooms,
                    bathrooms: formData.bathrooms,
                    garages: formData.garages,
                    area: formData.area,
                    city: formData.city,
                    state: formData.state,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setFormData(prev => ({ ...prev, description: data.description }))
            }
        } catch (error) {
            console.error('Erro ao gerar descrição:', error)
        } finally {
            setAiLoading(false)
        }
    }

    const handleSuggestPrice = async () => {
        if (!formData.area || !formData.city) {
            alert('Por favor, preencha a área e a cidade')
            return
        }

        setAiLoading(true)
        try {
            const response = await fetch('/api/ai/suggest-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: formData.type,
                    businessType: formData.businessType,
                    area: parseInt(formData.area),
                    bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
                    bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
                    garages: formData.garages ? parseInt(formData.garages) : undefined,
                    city: formData.city,
                    state: formData.state,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setFormData(prev => ({ ...prev, price: data.suggestedPrice.toString() }))
                setAiSuggestions(prev => ({ ...prev, suggestedPrice: data.suggestedPrice }))
            }
        } catch (error) {
            console.error('Erro ao sugerir preço:', error)
        } finally {
            setAiLoading(false)
        }
    }

    const handlePreview = async () => {
        setPreviewLoading(true)
        try {
            const response = await fetch('/api/ai/generate-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                // Em produção, isso redirecionaria para uma página de preview
                alert('Preview gerado com sucesso! Em produção, isso abriria uma página de visualização.')
            }
        } catch (error) {
            console.error('Erro ao gerar preview:', error)
        } finally {
            setPreviewLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            setUploading(true)
            try {
                // Simulação de upload - em produção, usaria Supabase Storage
                const newPhotos = Array.from(files).slice(0, 10) // Limite de 10 fotos
                setPhotos(prev => [...prev, ...newPhotos])
            } finally {
                setUploading(false)
            }
        }
    }

    const handleRemovePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Simulação de salvamento - em produção, enviaria para API
            await new Promise(resolve => setTimeout(resolve, 1500))

            alert('Imóvel cadastrado com sucesso!')
            router.push('/properties')
        } catch (error) {
            console.error('Erro ao cadastrar imóvel:', error)
            alert('Erro ao cadastrar imóvel. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: string) => {
        if (!value) return 'R$ 0,00'
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(parseFloat(value))
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/properties">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Novo Imóvel</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Cadastro inteligente com IA
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                IA Ativa
                            </Badge>
                            <Button
                                variant="outline"
                                onClick={handlePreview}
                                disabled={previewLoading}
                            >
                                {previewLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Preview
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Salvar Imóvel
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* AI Banner */}
                <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-6 border-0">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">IA Inteligente Ativada</h3>
                                <p className="text-white/80 text-sm">
                                    Nossa IA pode preencher automaticamente o título, descrição e sugerir o preço ideal com base em dados de mercado.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Título */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Título do Anúncio
                                    </CardTitle>
                                    <CardDescription>
                                        Um título atraente é essencial para atrair interessados
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateTitle}
                                    disabled={aiLoading || !formData.description}
                                >
                                    {aiLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Gerando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                                            Gerar com IA
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input
                                placeholder="Ex: Apartamento 3 Quartos - Brooklin, São Paulo - R$ 850.000"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="text-lg"
                            />
                            {aiSuggestions.title && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Título sugerido pela IA
                                </Badge>
                            )}
                        </CardContent>
                    </Card>

                    {/* Descrição */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Descrição Completa
                                    </CardTitle>
                                    <CardDescription>
                                        Descreva os pontos fortes do imóvel para atrair compradores
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateDescription}
                                    disabled={aiLoading}
                                >
                                    {aiLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Gerando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                                            Gerar com IA
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Descreva o imóvel com detalhes importantes: localização, características, pontos fortes, etc."
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={6}
                                className="resize-none"
                            />
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {formData.description?.length || 0} caracteres
                                </span>
                                {aiSuggestions.description && (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Descrição gerada pela IA
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Informações Básicas */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Home className="w-5 h-5 text-blue-600" />
                                    Informações Básicas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tipo de Imóvel</Label>
                                        <RadioGroup
                                            value={formData.type}
                                            onValueChange={(value) => handleInputChange('type', value as PropertyType)}
                                            className="grid grid-cols-2 gap-2"
                                        >
                                            {Object.values(PropertyType).map((type) => (
                                                <div key={type} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={type} id={type} />
                                                    <Label htmlFor={type} className="flex items-center gap-2 cursor-pointer">
                                                        <Home className="w-4 h-4" />
                                                        {type.toLowerCase().replace('_', ' ')}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tipo de Negócio</Label>
                                        <RadioGroup
                                            value={formData.businessType}
                                            onValueChange={(value) => handleInputChange('businessType', value as BusinessType)}
                                            className="grid grid-cols-3 gap-2"
                                        >
                                            {Object.values(BusinessType).map((type) => (
                                                <div key={type} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={type} id={type} />
                                                    <Label htmlFor={type} className="flex items-center gap-2 cursor-pointer">
                                                        <Building className="w-4 h-4" />
                                                        {type.toLowerCase().replace('_', ' ')}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="area">Área (m²)</Label>
                                        <Input
                                            id="area"
                                            type="number"
                                            placeholder="120"
                                            value={formData.area}
                                            onChange={(e) => handleInputChange('area', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price">Preço (R$)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="price"
                                                type="text"
                                                placeholder="850.000"
                                                value={formData.price}
                                                onChange={(e) => handleInputChange('price', e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSuggestPrice}
                                            disabled={aiLoading || !formData.area || !formData.city}
                                            className="w-full"
                                        >
                                            {aiLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Analisando...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                                                    Sugerir Preço com IA
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bedrooms">Quartos</Label>
                                        <Input
                                            id="bedrooms"
                                            type="number"
                                            placeholder="3"
                                            value={formData.bedrooms}
                                            onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bathrooms">Banheiros</Label>
                                        <Input
                                            id="bathrooms"
                                            type="number"
                                            placeholder="2"
                                            value={formData.bathrooms}
                                            onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="garages">Vagas</Label>
                                        <Input
                                            id="garages"
                                            type="number"
                                            placeholder="2"
                                            value={formData.garages}
                                            onChange={(e) => handleInputChange('garages', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Localização */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    Localização
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input
                                        id="city"
                                        placeholder="São Paulo"
                                        value={formData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state">Estado</Label>
                                    <Input
                                        id="state"
                                        placeholder="SP"
                                        value={formData.state}
                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="neighborhood">Bairro</Label>
                                    <Input
                                        id="neighborhood"
                                        placeholder="Brooklin"
                                        value={formData.neighborhood}
                                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                                    />
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                        Sugerido pela IA:
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-500">
                                        {formData.city && formData.state && (
                                            `${formData.city}, ${formData.state}`
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Fotos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-blue-600" />
                                Fotos do Imóvel
                                <Badge variant="secondary" className="ml-2">
                                    Máx. 10 fotos
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Adicione fotos para aumentar as chances de venda
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        id="photo-upload"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <label htmlFor="photo-upload" className="cursor-pointer">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                <ImageIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                                    Clique para adicionar fotos
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    JPG, PNG ou WebP (máx. 10MB cada)
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {photos.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {photos.map((photo, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                                                    <img
                                                        src={URL.createObjectURL(photo)}
                                                        alt={`Foto ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemovePhoto(index)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {photos.length > 0 && (
                                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                                        <span>{photos.length} foto(s) adicionada(s)</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPhotos([])}
                                        >
                                            Remover todas
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resumo com IA */}
                    {aiSuggestions.suggestedPrice && (
                        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                                    <Sparkles className="w-5 h-5" />
                                    Análise da IA
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Preço Sugerido</p>
                                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                            {formatCurrency(aiSuggestions.suggestedPrice)}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="w-8 h-8 text-amber-500" />
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Este preço foi sugerido com base em dados de mercado de imóveis similares na região.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Link href="/properties">
                            <Button variant="ghost" size="lg">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={handlePreview}
                                disabled={previewLoading}
                            >
                                {previewLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Preview
                                    </>
                                )}
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={loading || !formData.title || !formData.description}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Salvar Imóvel
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    )
}
