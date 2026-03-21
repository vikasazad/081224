"use client";

import { Button } from '@/components/ui/button'
import { Plus, Package, ChevronRight, Users, UtensilsCrossed } from 'lucide-react'
import React, { useState } from 'react'
import { InventoryTempleteNew } from './inventoryTempleteNew';
import { Badge } from "@/components/ui/badge";

// Template item interface
interface TemplateItem {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

// Saved template interface
interface SavedTemplate {
  id: string;
  eventType: string;
  eventTypeName: string;
  foodType: string;
  foodTypeName: string;
  numberOfPeople: number;
  items: TemplateItem[];
  createdAt: string;
}

const InventoryTemplete = ({ inventory }: any) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleBackTemplete = () => {
    setShowForm(false);
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  // Handle saving a new template or updating existing one
  const handleSaveTemplate = (templateData: Omit<SavedTemplate, 'id' | 'createdAt'>) => {
    if (isEditing && selectedTemplate) {
      // Update existing template
      const updatedTemplate: SavedTemplate = {
        ...templateData,
        id: selectedTemplate.id, // Keep the same ID
        createdAt: selectedTemplate.createdAt, // Keep the original creation date
      };
      
      setSavedTemplates((prev) =>
        prev.map((template) =>
          template.id === selectedTemplate.id ? updatedTemplate : template
        )
      );
      console.log("=== UPDATED TEMPLATE ===");
      console.log(updatedTemplate);
      console.log("========================");
    } else {
      // Create new template
      const newTemplate: SavedTemplate = {
        ...templateData,
        id: `TPL-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      setSavedTemplates((prev) => [...prev, newTemplate]);
      console.log("=== SAVED TEMPLATE ===");
      console.log(newTemplate);
      console.log("======================");
    }
    
    // Go back to list
    setShowForm(false);
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  // Handle creating new template
  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
    setShowForm(true);
  };

  // Handle template card click - view/edit
  const handleTemplateClick = (template: SavedTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setShowForm(true);
  };

  // Get food type display color
  const getFoodTypeColor = (foodType: string) => {
    switch (foodType) {
      case "veg":
        return "bg-green-500";
      case "non-veg":
        return "bg-red-500";
      case "both":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get total items count for a template
//   const getTemplateItemCount = (template: SavedTemplate): number => {
//     return template.items.reduce((total, item) => total + item.quantity, 0);
//   };

  // Show form view
  if (showForm) {
    return (
      <div>
        <InventoryTempleteNew
          inventory={inventory}
          handleBackTemplete={handleBackTemplete}
          onSaveTemplate={handleSaveTemplate}
          initialData={selectedTemplate}
          isEditing={isEditing}
        />
      </div>
    );
  }

  // Show templates list view
  return (
    <div className="px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage inventory templates for your events
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Inventory Template
        </Button>
      </div>

      {/* Templates Grid */}
      {savedTemplates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first inventory template to get started
          </p>
          <Button
            onClick={handleCreateNew}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {savedTemplates.map((template) => {
            // const itemCount = getTemplateItemCount(template);
            // const uniqueCategories = new Set(template.items.map(item => item.category)).size;

            return (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className="w-full p-4 rounded-lg border-2 transition-all duration-200 text-left border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              >
                {/* Template Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.eventTypeName}
                    </h3>
                    {/* <p className="text-sm text-gray-500 mt-0.5">
                      {template.id}
                    </p> */}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                {/* Template Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{template.numberOfPeople} people</span>
                  </div>
                  {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>{itemCount} items • {uniqueCategories} categories</span>
                  </div> */}
                </div>

                {/* Food Type Badge */}
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-1 text-[10px] text-gray-500">
                    <span
                      className={`w-2 h-2 rounded-full ${getFoodTypeColor(template.foodType)}`}
                    />
                    {template.foodTypeName}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-[10px] text-gray-500">
                    <UtensilsCrossed className="h-3 w-3" />
                    {template.items.length} unique items
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryTemplete;