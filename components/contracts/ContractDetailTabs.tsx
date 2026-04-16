import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Tab = {
    id: string;
    title: string;
    content: React.ReactNode;
};

type ContractDetailTabsProps = {
    tabs: Tab[];
    defaultActiveTab?: string;
};

export default function ContractDetailTabs({ tabs, defaultActiveTab }: ContractDetailTabsProps) {
    const [activeTab, setActiveTab] = useState<string>(defaultActiveTab ?? tabs[0].id);

    return (
        <div className="space-y-4">
            {/* Tab List */}
            <div className="flex flex-wrap gap-2 mb-4">
                {tabs.map((tab) => (
                    <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'default' : 'outline'}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.title}
                    </Button>
                ))}
            </div>

            {/* Tab Panels */}
            <div className="border rounded-md p-4">
                {tabs
                    .find((tab) => tab.id === activeTab)
                    ?.content}
            </div>
        </div>
    );
}