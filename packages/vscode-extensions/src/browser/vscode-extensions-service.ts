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

import { injectable, inject, postConstruct } from 'inversify';
import { DisposableCollection } from '@theia/core';
import { VSCodeExtensionsAPI } from './vscode-extensions-api';
import { SearchParam, VSCodeExtensionRaw, VSCodeExtension, VSCodeExtensionReviewList } from './vscode-extensions-types';
import { VSCodeExtensionsModel } from './vscode-extensions-model';

export type ExtensionKeywords = string[];
export const ExtensionKeywords = Symbol('ExtensionKeyword');

// for now to test the extension one has to start the Registry Server via https://gitpod.io/#https://github.com/theia-ide/extension-registry
// and copy then the workspace url plus '/api' to here
export const API_URL = '';

@injectable()
export class VSCodeExtensionsService {

    protected readonly toDispose = new DisposableCollection();

    @inject(VSCodeExtensionsAPI) protected readonly api: VSCodeExtensionsAPI;
    @inject(VSCodeExtensionsModel) protected readonly model: VSCodeExtensionsModel;

    @postConstruct()
    protected async init(): Promise<void> {
        this.updateSearch();
    }

    protected createEndpoint(arr: string[], queries?: { key: string, value: string | number }[]): string {
        const url = '/' + arr.reduce((acc, curr) => acc + (curr ? '/' + curr : ''));
        const queryString = queries ? '?' + queries.map<string>(obj => obj.key + '=' + obj.value).join('&') : '';
        return API_URL + url + queryString;
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    async updateSearch(param?: SearchParam): Promise<void> {
        const endpoint = this.createEndpoint(['-', 'search'], param && param.query ? [{ key: 'query', value: param.query }] : undefined);
        const extensions = await this.api.getExtensions(endpoint);
        this.model.extensions = extensions;
    }

    async installed(): Promise<VSCodeExtensionRaw[]> {
        // TODO
        return [];
    }

    async outdated(): Promise<VSCodeExtensionRaw[]> {
        const result: VSCodeExtensionRaw[] = [];
        const promises: Promise<void>[] = [];
        // TODO get outdated extensions
        await Promise.all(promises);
        return result;
    }

    async getExtensionDetail(extensionURL: string): Promise<VSCodeExtension> {
        return this.api.getExtension(extensionURL);
    }

    async getExtensionReadMe(readMeUrl: string): Promise<string> {
        const readMeRaw = await this.api.getExtensionReadMe(readMeUrl);
        return readMeRaw;
    }

    async getExtensionReviews(reviewsUrl: string): Promise<VSCodeExtensionReviewList> {
        return this.api.getExtensionReviews(reviewsUrl);
    }

    async openExtensionDetail(extensionURL: string): Promise<void> {
        const detail = await this.getExtensionDetail(extensionURL);
        console.log('THE DETAIL', detail);
    }
}
