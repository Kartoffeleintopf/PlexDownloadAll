// ==UserScript==
// @name Plex download all series episodes
// @namespace https://app.plex.tv/
// @include /^https://app\.plex\.tv/desktop/.*$/
// @version 1
// @description Plex download all
// @author Kartoffeleintopf
// @run-at document-start
// @noframes 
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./Source/Index.ts":
/*!*************************!*\
  !*** ./Source/Index.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const PlexDownload_1 = __webpack_require__(/*! ./PlexDownload */ "./Source/PlexDownload.ts");
{
    const lPlexDownload = new PlexDownload_1.PlexDownload();
    /**
     * Start download.
     * Decide single or multi download.
     */
    const lStartDownloadFunction = async () => {
        const lIsSingleMedia = document.querySelectorAll('*[class*="PrePlayDescendantList"').length === 0;
        const lIsSeasonMedia = document.querySelectorAll('*[data-qa-id="preplay-mainTitle"] a').length > 0;
        const lCurrentUrl = window.location.href;
        try {
            if (lIsSingleMedia) {
                await lPlexDownload.downloadSingleMediaItemByUrl(lCurrentUrl);
            }
            else if (lIsSeasonMedia) {
                await lPlexDownload.downloadSeasonMediaItemByUrl(lCurrentUrl);
            }
            else {
                await lPlexDownload.downloadSeriesMediaItemByUrl(lCurrentUrl);
            }
        }
        catch (e) {
            if (e instanceof Error) {
                alert(e.message);
            }
            else {
                alert(e);
            }
        }
    };
    // Scan for play button and append download button.
    setInterval(() => {
        const lPlayButton = document.querySelector('*[data-qa-id="preplay-play"]');
        if (lPlayButton) {
            const lDownloadbutton = document.querySelector('.plexDownloadButton');
            if (!lDownloadbutton) {
                // Create new download button.
                const lNewDownloadButton = document.createElement('button');
                lNewDownloadButton.setAttribute('style', `
                    height: 30px;
                    padding: 0 15px;
                    background-color: #e5a00d;
                    color: #1f2326;
                    border: 0;
                    font-family: Open Sans Semibold,Helvetica Neue,Helvetica,Arial,sans-serif; 
                    text-transform: uppercase;              
                    border-radius: 4px;
                    overflow: hidden;
                `);
                lNewDownloadButton.classList.add('plexDownloadButton');
                lNewDownloadButton.addEventListener('click', async () => {
                    // Set button disabled. 
                    lNewDownloadButton.disabled = true;
                    lNewDownloadButton.style.backgroundColor = '#333';
                    // Wait for all metadata to load.
                    await lStartDownloadFunction();
                    // Enable button.
                    lNewDownloadButton.disabled = false;
                    lNewDownloadButton.style.backgroundColor = '#e5a00d';
                });
                lNewDownloadButton.appendChild(document.createTextNode('Download'));
                // Append download button after play button.
                lPlayButton.after(lNewDownloadButton);
            }
        }
    }, 250);
}


/***/ }),

/***/ "./Source/PlexDownload.ts":
/*!********************************!*\
  !*** ./Source/PlexDownload.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PlexDownload = void 0;
const PlexService_1 = __webpack_require__(/*! ./PlexService */ "./Source/PlexService.ts");
class PlexDownload {
    /**
     * Constructor.
     * Initialize download overlay.
     */
    constructor() {
        // Create overlay if it does not exists.
        if (document.querySelector('.PlexDownloadOverlay') === null) {
            // Create overlay element.
            const lNewDownloadOverlay = document.createElement('div');
            lNewDownloadOverlay.classList.add('PlexDownloadOverlay');
            lNewDownloadOverlay.setAttribute('style', `
                position: fixed;
                bottom: 6px;
                right: 6px;
                width: 360px;
                background-color: #191a1c;
                border-radius: 8px;
                max-height: 300px;
                overflow: auto;
                box-shadow: 0 4px 10px rgb(0 0 0 / 35%);
                font-family: Open Sans Regular,Helvetica Neue,Helvetica,Arial,sans-serif; 
                font-size: 13px;
            `);
            // Append to body root.
            document.body.appendChild(lNewDownloadOverlay);
        }
    }
    /**
     * Add all media item file of a season to the download queue.
     * @param pUrl - Media url.
     */
    async downloadSeasonMediaItemByUrl(pUrl) {
        const lPlexService = new PlexService_1.PlexService();
        const lUrlList = await lPlexService.getSeasonFileItemList(pUrl);
        // Add each url to download queue
        for (const lUrl of lUrlList) {
            this.addDownloadToQueue(lUrl);
        }
    }
    /**
     * Add all media item file of a series to the download queue.
     * @param pUrl - Media url.
     */
    async downloadSeriesMediaItemByUrl(pUrl) {
        const lPlexService = new PlexService_1.PlexService();
        const lUrlList = await lPlexService.getSerieFileItemList(pUrl);
        // Add each url to download queue
        for (const lUrl of lUrlList) {
            this.addDownloadToQueue(lUrl);
        }
    }
    /**
     * Add single media item file to the download queue.
     * @param pUrl - Media url.
     */
    async downloadSingleMediaItemByUrl(pUrl) {
        const lPlexService = new PlexService_1.PlexService();
        const lUrlList = await lPlexService.getEpisodeFileItemList(pUrl);
        // Add each url to download queue
        for (const lUrl of lUrlList) {
            this.addDownloadToQueue(lUrl);
        }
    }
    /**
     * Add download url to the download queue.
     * @param pMediaItem - Download url.
     */
    addDownloadToQueue(pMediaItem) {
        // Create download row element.
        const lDownloadElement = document.createElement('div');
        lDownloadElement.setAttribute('data-url', pMediaItem.url);
        lDownloadElement.setAttribute('data-filename', pMediaItem.fileName);
        lDownloadElement.setAttribute('style', 'display: flex; border-bottom: 1px solid #7a7b7b; margin: 0px 6px; padding: 10px 0px;');
        lDownloadElement.classList.add('PlexDownloadElement');
        // Create download file name.
        const lDownloadElementFileName = document.createElement('div');
        lDownloadElementFileName.appendChild(document.createTextNode(pMediaItem.fileName));
        lDownloadElementFileName.classList.add('PlexDownloadElementFileName');
        lDownloadElementFileName.setAttribute('style', 'flex: 1; border-right: 2px solid #545556; padding: 0 10px; overflow: hidden; white-space: nowrap; font-family: inherit; font-size: inherit;');
        // Create download progess.
        const lDownloadElementProgress = document.createElement('div');
        lDownloadElementProgress.appendChild(document.createTextNode('...'));
        lDownloadElementProgress.classList.add('PlexDownloadElementProgress');
        lDownloadElementProgress.setAttribute('style', 'width: 75px; padding: 0px 5px; border-right: 2px solid #545556; text-align: right;');
        // Create download progess.
        const lDownloadElementAbort = document.createElement('div');
        lDownloadElementAbort.appendChild(document.createTextNode('X'));
        lDownloadElementAbort.classList.add('PlexDownloadElementAbort');
        lDownloadElementAbort.setAttribute('style', 'color: #ff3f3f; padding: 0px 10px; font-weight: bolder; cursor: pointer;');
        lDownloadElementAbort.addEventListener('click', () => {
            lDownloadElement.remove();
        });
        // Add data element to download element.
        lDownloadElement.appendChild(lDownloadElementFileName);
        lDownloadElement.appendChild(lDownloadElementProgress);
        lDownloadElement.appendChild(lDownloadElementAbort);
        // Append download element to download overlay.
        document.querySelector('.PlexDownloadOverlay').appendChild(lDownloadElement);
        // Try to start this download.
        this.startNextDownloadElement();
    }
    /**
     * Download blob to user file system.
     * @param pBlob - Blob.
     * @param pFileName - Filename of downloaded file.
     */
    downloadBlob(pBlob, pFileName) {
        // Convert blob to download url.
        const lBlobDownloadUrl = URL.createObjectURL(pBlob);
        // Create download anchor element.
        const lAnchorElement = document.createElement('a');
        // Ser file name and href.
        lAnchorElement.href = lBlobDownloadUrl;
        lAnchorElement.download = pFileName;
        // Append link to the body.
        document.body.appendChild(lAnchorElement);
        // Dispatch click event on the anchor.
        lAnchorElement.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        }));
        // Remove anchor from body.
        document.body.removeChild(lAnchorElement);
    }
    /**
     * Get the next download element and start downloading
     * if no other download is running.
     */
    startNextDownloadElement() {
        // Dont start next download if one is currently running.
        if (document.querySelector('.PlexDownloadElement.Running') !== null) {
            return;
        }
        // Get next download element. Should be the first.
        const lDownloadElement = document.querySelector('.PlexDownloadElement');
        if (lDownloadElement) {
            // Set download element as running.
            lDownloadElement.classList.add('Running');
            // Get needed data.
            const lDownloadUrl = lDownloadElement.getAttribute('data-url');
            const lFileName = lDownloadElement.getAttribute('data-filename');
            const lProgressElement = lDownloadElement.querySelector('.PlexDownloadElementProgress');
            const lAbortElement = lDownloadElement.querySelector('.PlexDownloadElementAbort');
            // Close download element function.
            const lCloseDownloadElement = () => {
                lDownloadElement.remove();
                this.startNextDownloadElement();
            };
            // Create and start xhr.
            const lXhrRequest = new XMLHttpRequest();
            lXhrRequest.open('GET', lDownloadUrl, true);
            lXhrRequest.responseType = 'blob';
            lXhrRequest.onprogress = function (pProgressEvent) {
                // Clear progress content.
                lProgressElement.innerHTML = '';
                if (pProgressEvent.lengthComputable) {
                    // Add progress in percent.
                    const lProgressInPercent = (pProgressEvent.loaded / pProgressEvent.total) * 100;
                    const lProgressTwoDecimals = Math.round(lProgressInPercent * 100) / 100;
                    // Add progress as percent.      
                    lProgressElement.appendChild(document.createTextNode(`${lProgressTwoDecimals}%`));
                }
                else {
                    // Progress in mega byte
                    const lProgressInMegaByte = pProgressEvent.loaded / 1024 / 1024;
                    // Add progress as mb.      
                    lProgressElement.appendChild(document.createTextNode(`${lProgressInMegaByte}MB`));
                }
            };
            lXhrRequest.onload = () => {
                // Read response.
                const lBlob = lXhrRequest.response;
                // Download blob.
                this.downloadBlob(lBlob, lFileName);
                // Start next download.
                lCloseDownloadElement();
            };
            lXhrRequest.send();
            // Add abort download event.
            lAbortElement.addEventListener('click', () => {
                lXhrRequest.abort();
                lCloseDownloadElement();
            });
        }
    }
}
exports.PlexDownload = PlexDownload;


/***/ }),

/***/ "./Source/PlexService.ts":
/*!*******************************!*\
  !*** ./Source/PlexService.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PlexService = void 0;
class PlexService {
    /**
     * Constructor.
     */
    constructor() {
        // Set XPath config.
        this.mXPathConfig = {
            accessTokenXpath: "//Device[@clientIdentifier='{clientid}']/@accessToken",
            baseUriXpath: "//Device[@clientIdentifier='{clientid}']/Connection[@local='0']/@uri",
            mediaKeyXpath: '//Media/Part[1]/@key',
            mediaFilenameXpath: '//Media/Part[1]/@file',
            mediaChildrenFileMetaIdXpath: '//Video/@ratingKey',
            mediaChildrenDirectoryMetaIdXpath: '//Directory/@ratingKey'
        };
        // Set url config.
        this.mUrlConfig = {
            apiResourceUrl: 'https://plex.tv/api/resources?includeHttps=1&includeRelay=1&X-Plex-Token={token}',
            apiLibraryUrl: '{baseuri}/library/metadata/{id}?X-Plex-Token={token}',
            apiChildrenUrl: '{baseuri}/library/metadata/{metaId}/children?excludeAllLeaves=1&X-Plex-Token={token}&X-Plex-Container-Start=0&X-Plex-Container-Size=2000',
            downloadUrl: '{baseuri}{mediakey}?download=1&X-Plex-Token={token}'
        };
    }
    /**
     * Get download link for single episode or movie.
     * @param pMediaUrl - Media url.
     */
    async getEpisodeFileItemList(pMediaUrl) {
        const lAccessConfiguration = await this.getLibraryAccess(pMediaUrl);
        const lMetaDataId = this.getMediaMetaDataId(pMediaUrl);
        const lMediaConnection = await this.getMediaFileConnection(lAccessConfiguration, lMetaDataId);
        return [this.getMediaFileItem(lMediaConnection)];
    }
    /**
     * Get download link for all episodes of a season.
     * @param pMediaUrl - Media url.
     */
    async getSeasonFileItemList(pMediaUrl) {
        const lAccessConfiguration = await this.getLibraryAccess(pMediaUrl);
        const lMetaDataId = this.getMediaMetaDataId(pMediaUrl);
        const lChildFileConnectionList = await this.getMediaDirectoryChildFileConnections(lAccessConfiguration, lMetaDataId);
        // Generate file items of file connections.
        const lMediaFileItemList = new Array();
        for (const lConnection of lChildFileConnectionList) {
            lMediaFileItemList.push(this.getMediaFileItem(lConnection));
        }
        return lMediaFileItemList;
    }
    /**
     * Get download link for all episodes of a series.
     * @param pMediaUrl - Media url.
     */
    async getSerieFileItemList(pMediaUrl) {
        const lAccessConfiguration = await this.getLibraryAccess(pMediaUrl);
        const lMetaDataId = this.getMediaMetaDataId(pMediaUrl);
        const lDirecoryList = await this.getMediaChildDirectoryList(lAccessConfiguration, lMetaDataId);
        // Generate file items of file connections.
        const lMediaFileItemList = new Array();
        // For each season.
        for (const lDirectory of lDirecoryList) {
            const lChildFileConnectionList = await this.getMediaDirectoryChildFileConnections(lAccessConfiguration, lDirectory.metaDataId);
            // Generate file items of file connections.
            for (const lConnection of lChildFileConnectionList) {
                lMediaFileItemList.push(this.getMediaFileItem(lConnection));
            }
        }
        return lMediaFileItemList;
    }
    /**
     * Get access configuration for the current viewed media container.
     * @param pLibraryUrl - Url of any media item inside the library.
     */
    async getLibraryAccess(pLibraryUrl) {
        const lClientIdMatch = /server\/([a-f0-9]{40})\//.exec(pLibraryUrl);
        const lLoginToken = localStorage.getItem('myPlexAccessToken');
        // Validate client id.
        if (!lClientIdMatch || lClientIdMatch.length !== 2) {
            throw Error('Invalid media item url.');
        }
        // Check if the user is logged in.
        if (!lLoginToken) {
            throw new Error('You are currently not browsing or logged into a Plex web environment.');
        }
        // Load media container information.
        const lApiXml = await this.loadXml(this.mUrlConfig.apiResourceUrl.replace('{token}', lLoginToken));
        // Try to get access token and base uri.
        const lAccessTokenNode = lApiXml.evaluate(this.mXPathConfig.accessTokenXpath.replace('{clientid}', lClientIdMatch[1]), lApiXml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const lBaseUriNode = lApiXml.evaluate(this.mXPathConfig.baseUriXpath.replace('{clientid}', lClientIdMatch[1]), lApiXml, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
        // base uri list
        const lBaseUriList = new Array();
        {
            // Iterate over all base uri nodes and save text content in array.
            let lIteratorNode = lBaseUriNode.iterateNext();
            while (lIteratorNode) {
                lBaseUriList.push(lIteratorNode.textContent);
                lIteratorNode = lBaseUriNode.iterateNext();
            }
        }
        // Validate access token and base url.
        if (!lAccessTokenNode.singleNodeValue) {
            throw new Error('Cannot find a valid accessToken.');
        }
        else if (lBaseUriList.length === 0) {
            throw new Error('Cannot find a valid base uri.');
        }
        return {
            accessToken: lAccessTokenNode.singleNodeValue.textContent,
            baseUriList: lBaseUriList
        };
    }
    /**
     *
     * @param pLibraryAccess - Library access.
     * @param pMetaDataId - Directory meta data id.
     */
    async getMediaChildDirectoryList(pLibraryAccess, pMetaDataId) {
        for (const lBaseUri of pLibraryAccess.baseUriList) {
            // Try to get media
            try {
                // Create child url.
                let lMediaChildUrl = this.mUrlConfig.apiChildrenUrl;
                lMediaChildUrl = lMediaChildUrl.replace('{baseuri}', lBaseUri);
                lMediaChildUrl = lMediaChildUrl.replace('{metaId}', pMetaDataId);
                lMediaChildUrl = lMediaChildUrl.replace('{token}', pLibraryAccess.accessToken);
                // Get media childs xml.
                const lChildXml = await this.loadXml(lMediaChildUrl);
                // Get child informations.
                const lMetaDataIdNodes = lChildXml.evaluate(this.mXPathConfig.mediaChildrenDirectoryMetaIdXpath, lChildXml, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                // Convert in string arrays.
                const lMetaDataIdList = new Array();
                {
                    // Iterate over all base uri nodes and save text content in array.
                    let lMetaDataIdIteratorNode = lMetaDataIdNodes.iterateNext();
                    while (lMetaDataIdIteratorNode) {
                        lMetaDataIdList.push(lMetaDataIdIteratorNode.textContent);
                        lMetaDataIdIteratorNode = lMetaDataIdNodes.iterateNext();
                    }
                }
                // Build media connections from ordered result lists.
                const mMediaConnectionList = new Array();
                for (const lMetaDataId of lMetaDataIdList) {
                    mMediaConnectionList.push({
                        baseUri: lBaseUri,
                        accessToken: pLibraryAccess.accessToken,
                        metaDataId: lMetaDataId
                    });
                }
                return mMediaConnectionList;
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.log(e);
                // Try next base uri.
                continue;
            }
        }
        throw new Error('No directory connection for this MetaID found');
    }
    /**
     * Get all child file connections for a media directory.
     * @param pLibraryAccess - Library access.
     * @param pDirectoryMetaDataId - Media meta data id.
     */
    async getMediaDirectoryChildFileConnections(pLibraryAccess, pDirectoryMetaDataId) {
        for (const lBaseUri of pLibraryAccess.baseUriList) {
            // Try to get media
            try {
                // Create child url.
                let lMediaChildUrl = this.mUrlConfig.apiChildrenUrl;
                lMediaChildUrl = lMediaChildUrl.replace('{baseuri}', lBaseUri);
                lMediaChildUrl = lMediaChildUrl.replace('{metaId}', pDirectoryMetaDataId);
                lMediaChildUrl = lMediaChildUrl.replace('{token}', pLibraryAccess.accessToken);
                // Get media childs xml.
                const lChildXml = await this.loadXml(lMediaChildUrl);
                // Get child informations.
                const lMediaKeyNodes = lChildXml.evaluate(this.mXPathConfig.mediaKeyXpath, lChildXml, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                const lFileNameNodes = lChildXml.evaluate(this.mXPathConfig.mediaFilenameXpath, lChildXml, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                const lMetaDataIdNodes = lChildXml.evaluate(this.mXPathConfig.mediaChildrenFileMetaIdXpath, lChildXml, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                // Convert in string arrays.
                const lMediaKeyList = new Array();
                const lFileNameList = new Array();
                const lMetaDataIdList = new Array();
                {
                    // Iterate over all base uri nodes and save text content in array.
                    let lMediaKeyIteratorNode = lMediaKeyNodes.iterateNext();
                    let lFileNameIteratorNode = lFileNameNodes.iterateNext();
                    let lMetaDataIdIteratorNode = lMetaDataIdNodes.iterateNext();
                    while (lMediaKeyIteratorNode && lFileNameIteratorNode && lMetaDataIdIteratorNode) {
                        lMediaKeyList.push(lMediaKeyIteratorNode.textContent);
                        lFileNameList.push(lFileNameIteratorNode.textContent.split('/').pop());
                        lMetaDataIdList.push(lMetaDataIdIteratorNode.textContent);
                        lMediaKeyIteratorNode = lMediaKeyNodes.iterateNext();
                        lFileNameIteratorNode = lFileNameNodes.iterateNext();
                        lMetaDataIdIteratorNode = lMetaDataIdNodes.iterateNext();
                    }
                    // Validate same same.
                    if (lMediaKeyIteratorNode || lFileNameIteratorNode || lMetaDataIdIteratorNode) {
                        throw new Error('Wrong result for media item children.');
                    }
                }
                // Build media connections from ordered result lists.
                const mMediaConnectionList = new Array();
                for (let lIndex = 0; lIndex < lMetaDataIdList.length; lIndex++) {
                    mMediaConnectionList.push({
                        mediaKey: lMediaKeyList[lIndex],
                        baseUri: lBaseUri,
                        accessToken: pLibraryAccess.accessToken,
                        metaDataId: lMetaDataIdList[lIndex],
                        fileName: lFileNameList[lIndex]
                    });
                }
                return mMediaConnectionList;
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.log(e);
                // Try next base uri.
                continue;
            }
        }
        throw new Error('No file connection for this MetaID found');
    }
    /**
     * Get connection data for media item.
     * @param pAccessConfiguration - Device access configuration.
     * @param pFileMetaDataId - MetaData Id.
     */
    async getMediaFileConnection(pAccessConfiguration, pFileMetaDataId) {
        for (const lBaseUri of pAccessConfiguration.baseUriList) {
            // Try to get media
            try {
                // Create media url.
                let lMediaUrl = this.mUrlConfig.apiLibraryUrl;
                lMediaUrl = lMediaUrl.replace('{baseuri}', lBaseUri);
                lMediaUrl = lMediaUrl.replace('{id}', pFileMetaDataId);
                lMediaUrl = lMediaUrl.replace('{token}', pAccessConfiguration.accessToken);
                // Get media xml.
                const lDocument = await this.loadXml(lMediaUrl);
                // Load media key and validate.
                const lMediaKeyNode = lDocument.evaluate(this.mXPathConfig.mediaKeyXpath, lDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                if (!lMediaKeyNode.singleNodeValue) {
                    throw new Error('Media item is no file.');
                }
                // Try to get filename.
                const lFileNameNode = lDocument.evaluate(this.mXPathConfig.mediaFilenameXpath, lDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                if (!lFileNameNode.singleNodeValue) {
                    throw new Error('No filename for this media item found.');
                }
                // Get filename from last part of the path.
                const lFileName = lFileNameNode.singleNodeValue.textContent.split('/').pop();
                return {
                    mediaKey: lMediaKeyNode.singleNodeValue.textContent,
                    baseUri: lBaseUri,
                    accessToken: pAccessConfiguration.accessToken,
                    metaDataId: pFileMetaDataId,
                    fileName: lFileName
                };
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.log(e);
                // Try next base uri.
                continue;
            }
        }
        throw new Error('No connection for this MetaID found');
    }
    /**
     * Get download url of media.
     * @param pMediaFileConnection - Media connection.
     * @returns download url of media.
     */
    getMediaFileItem(pMediaFileConnection) {
        // Build download url.
        let lDownloadUrl = this.mUrlConfig.downloadUrl;
        lDownloadUrl = lDownloadUrl.replace('{baseuri}', pMediaFileConnection.baseUri);
        lDownloadUrl = lDownloadUrl.replace('{token}', pMediaFileConnection.accessToken);
        lDownloadUrl = lDownloadUrl.replace('{mediakey}', pMediaFileConnection.mediaKey);
        return {
            url: lDownloadUrl,
            fileName: pMediaFileConnection.fileName
        };
    }
    /**
     * Get media id from url.
     * @param pMediaUrl - Current url.
     */
    getMediaMetaDataId(pMediaUrl) {
        const metadataId = /key=%2Flibrary%2Fmetadata%2F(\d+)/.exec(pMediaUrl);
        if (metadataId && metadataId.length === 2) {
            return metadataId[1]; // First group.
        }
        else {
            throw new Error('No single media item found for url.');
        }
    }
    /**
     * Get url response as xml document
     * @param pUrl - Url.
     */
    async loadXml(pUrl) {
        return fetch(pUrl).then(async (pResponse) => {
            return pResponse.text();
        }).then((pResponeText) => {
            return new DOMParser().parseFromString(pResponeText, 'text/xml');
        });
    }
}
exports.PlexService = PlexService;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	__webpack_require__("./Source/Index.ts");
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_require__("./Source/PlexDownload.ts");
/******/ 	var __webpack_exports__ = __webpack_require__("./Source/PlexService.ts");
/******/ 	
/******/ })()
;