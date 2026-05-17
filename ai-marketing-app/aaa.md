src/App.tsx:13:10 - error TS6133: 'PenTool' is declared but its value is never read.

13 import { PenTool, ChevronRight, ArrowRight, Plus, LogOut, User, Building2, ShieldCheck, Library, Users } from 'lucide-react'
            ~~~~~~~

src/App.tsx:13:65 - error TS6133: 'Building2' is declared but its value is never read.

13 import { PenTool, ChevronRight, ArrowRight, Plus, LogOut, User, Building2, ShieldCheck, Library, Users } from 'lucide-react'
                                                                   ~~~~~~~~~

src/App.tsx:13:89 - error TS6133: 'Library' is declared but its value is never read.

13 import { PenTool, ChevronRight, ArrowRight, Plus, LogOut, User, Building2, ShieldCheck, Library, Users } from 'lucide-react'
                                                                                           ~~~~~~~

src/App.tsx:13:98 - error TS6133: 'Users' is declared but its value is never read.

13 import { PenTool, ChevronRight, ArrowRight, Plus, LogOut, User, Building2, ShieldCheck, Library, Users } from 'lucide-react'
                                                                                                    ~~~~~

src/App.tsx:27:25 - error TS6133: 'setSidebarOpen' is declared but its value is never read.

27   const [isSidebarOpen, setSidebarOpen] = useState(true)
                           ~~~~~~~~~~~~~~

src/components/AssetLibrary.tsx:5:9 - error TS6133: 'MoreVertical' is declared but its value is never read.

5   Plus, MoreVertical, Trash2, Download, ExternalLink,
          ~~~~~~~~~~~~

src/components/AssetLibrary.tsx:5:23 - error TS6133: 'Trash2' is declared but its value is never read.

5   Plus, MoreVertical, Trash2, Download, ExternalLink,
                        ~~~~~~

src/components/AssetLibrary.tsx:5:41 - error TS6133: 'ExternalLink' is declared but its value is never read.

5   Plus, MoreVertical, Trash2, Download, ExternalLink,
                                          ~~~~~~~~~~~~

src/components/AssetLibrary.tsx:6:3 - error TS6133: 'ChevronRight' is declared but its value is never read.

6   ChevronRight, Sparkles, Filter, File
    ~~~~~~~~~~~~

src/components/AssetLibrary.tsx:6:27 - error TS6133: 'Filter' is declared but its value is never read.

6   ChevronRight, Sparkles, Filter, File
                            ~~~~~~

src/components/AssetLibrary.tsx:6:35 - error TS6133: 'File' is declared but its value is never read.

6   ChevronRight, Sparkles, Filter, File
                                    ~~~~

src/components/AssetLibrary.tsx:84:9 - error TS6133: 'filteredAssets' is declared but its value is never read.

84   const filteredAssets = assets.filter(a =>
           ~~~~~~~~~~~~~~

src/components/CampaignStudio.tsx:651:26 - error TS6133: 'id' is declared but its value is never read.

651 function ResultSection({ id, icon, title, expanded, onToggle, children }: {
                             ~~

src/components/CreativeStudio.tsx:10:3 - error TS6133: 'Search' is declared but its value is never read.

10   Search,
     ~~~~~~

src/components/CreativeStudio.tsx:11:3 - error TS6133: 'Check' is declared but its value is never read.

11   Check,
     ~~~~~

src/components/CreativeStudio.tsx:15:3 - error TS6133: 'GitCompare' is declared but its value is never read.

15   GitCompare,
     ~~~~~~~~~~

src/components/CreativeStudio.tsx:16:3 - error TS6133: 'ArrowRight' is declared but its value is never read.

16   ArrowRight,
     ~~~~~~~~~~

src/components/CreativeStudio.tsx:83:21 - error TS6133: 'setUseSearch' is declared but its value is never read.

83   const [useSearch, setUseSearch] = useState(false)
                       ~~~~~~~~~~~~

src/components/CreativeStudio.tsx:189:13 - error TS2353: Object literal may only specify known properties, and 'splitByGrapheme' does not exist in type 'ITextOptions'.

189             splitByGrapheme: true // Word wrap for long text
                ~~~~~~~~~~~~~~~

src/components/Header.tsx:1:33 - error TS6133: 'UserCircle' is declared but its value is never read.

1 import { Search, Bell, History, UserCircle } from 'lucide-react'
                                  ~~~~~~~~~~

src/components/NewProjectModal.tsx:28:28 - error TS2503: Cannot find namespace 'NodeJS'.

28   const searchRef = useRef<NodeJS.Timeout | null>(null)
                              ~~~~~~

src/components/TeamSpace.tsx:1:8 - error TS6133: 'React' is declared but its value is never read.

1 import React, { useState, useEffect } from 'react'
         ~~~~~

src/components/TeamSpace.tsx:6:22 - error TS6133: 'Star' is declared but its value is never read.

6   Clock, ArrowRight, Star, Globe, Lock
                       ~~~~

src/components/TeamSpace.tsx:6:35 - error TS6133: 'Lock' is declared but its value is never read.

6   Clock, ArrowRight, Star, Globe, Lock
                                    ~~~~

src/components/TeamSpace.tsx:29:31 - error TS6133: 'user' is declared but its value is never read.

29   const { token, currentTeam, user } = useAuth()
                                 ~~~~

src/components/TeamSpace.tsx:33:10 - error TS6133: 'isLoading' is declared but its value is never read.

33   const [isLoading, setIsLoading] = useState(true)
            ~~~~~~~~~

src/context/AuthContext.tsx:1:8 - error TS6133: 'React' is declared but its value is never read.

1 import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
         ~~~~~

src/context/AuthContext.tsx:1:65 - error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.

1 import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
                                                                  ~~~~~~~~~


Found 28 errors.