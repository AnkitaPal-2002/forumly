import React from 'react'

import { Sidebar } from '@/components/layouts/Sidebar'
import CreateCommunity from '@/components/layouts/CreateCommunity'
import { db } from '@/lib/db'

const layout = async ({
    children
}: {
    children: React.ReactNode
}) => {

    const resentSubForum = await db.subforum.findMany({
        take: 2,
        orderBy: {
            createdAt: 'desc',
        }
    });

    const communitySubForum = await db.subforum.findMany({
        take: 6,
        orderBy: {
            createdAt: 'asc',
        }
    });



    return (
        <div className="min-h-screen bg-inherit">
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="space-y-2 lg:col-span-1">
                        <Sidebar
                            resentSubForum={resentSubForum}
                            communitySubForum={communitySubForum}
                        />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                        {children}
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <CreateCommunity />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default layout
