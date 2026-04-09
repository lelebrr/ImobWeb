"use client"

import * as React from "react"
import { useBranding } from "./branding-provider"
import { Button } from "../design-system/button"
import { Card, CardContent, CardHeader, CardTitle } from "../design-system/card"
import { Input } from "../design-system/input"
import { Label } from "../design-system/label"

export function ThemeCustomizer() {
  const { config, updateConfig } = useBranding()
  const [primaryColor, setPrimaryColor] = React.useState(config.primary)

  const handleSave = () => {
    updateConfig({ primary: primaryColor })
    // Aqui no futuro: salvar no Supabase / Organization Settings
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Customização da Imobiliária</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primary">Cor Primária (HSL)</Label>
          <div className="flex gap-2">
            <Input 
              id="primary" 
              value={primaryColor} 
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="Ex: 221.2 83.2% 53.3%"
            />
            <div 
              className="w-10 h-10 rounded border" 
              style={{ backgroundColor: `hsl(${primaryColor})` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="radius">Arredondamento das Bordas</Label>
          <div className="flex gap-2">
            <Button 
              variant={config.radius === "0rem" ? "default" : "outline"} 
              size="sm" 
              onClick={() => updateConfig({ radius: "0rem" })}
            >
              Sharp
            </Button>
            <Button 
              variant={config.radius === "0.5rem" ? "default" : "outline"} 
              size="sm" 
              onClick={() => updateConfig({ radius: "0.5rem" })}
            >
              Default
            </Button>
            <Button 
              variant={config.radius === "1rem" ? "default" : "outline"} 
              size="sm" 
              onClick={() => updateConfig({ radius: "1rem" })}
            >
              Curvy
            </Button>
          </div>
        </div>

        <Button className="w-full mt-4" onClick={handleSave}>
          Aplicar Identidade Visual
        </Button>
      </CardContent>
    </Card>
  )
}
