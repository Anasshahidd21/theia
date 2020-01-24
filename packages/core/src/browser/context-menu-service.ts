/********************************************************************************
 * Copyright (C) 2019 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { TabBar, Widget, Title } from '@phosphor/widgets';
import { injectable, inject } from 'inversify';
import { ApplicationShell } from './shell/application-shell';

@injectable()
export class ContextMenuService {

    @inject(ApplicationShell) protected readonly shell: ApplicationShell;

    findTitle(tabBar: TabBar<Widget> | undefined, event?: Event): Title<Widget> | undefined {
        if (event && event.target) {
            let tabNode: HTMLElement | null = event.target as HTMLElement;
            while (tabNode && !tabNode.classList.contains('p-TabBar-tab')) {
                tabNode = tabNode.parentElement;
            }
            if (tabBar && tabNode && tabNode.title) {
                let title = tabBar.titles.find(t => t.caption === tabNode!.title);
                if (title) {
                    return title;
                }
                title = tabBar.titles.find(t => t.label === tabNode!.title);
                if (title) {
                    return title;
                }
            }
        }
        return tabBar ? tabBar.currentTitle || undefined : undefined;
    }

    findTabBar(event?: Event): TabBar<Widget> | undefined {
        if (event && event.target) {
            const tabBar = this.shell.findWidgetForElement(event.target as HTMLElement);
            if (tabBar instanceof TabBar) {
                return tabBar;
            }
        }
        return this.shell.currentTabBar;
    }

}
