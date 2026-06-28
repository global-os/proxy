(ns editor)

;; Squint .gapp reference editor
;;
;; Sustainable practices:
;; - Yjs Y.Text holds canonical document bytes; the textarea mirrors it (observe + input).
;; - RxJS pipes kernel postMessage traffic; no raw addEventListener for app protocol.
;; - Kernel only: ready, init/init:fresh, save — never fetch /api from the iframe.
;; - Platform deps are vendored IIFE files (yjs.js, rxjs.js) declared in gapp.json.
;; - Save prompts for a desktop filename; payload content is read from Y.Text.

(def state (atom {:filename "Untitled.txt" :saving false}))

(def doc (js/Y.Doc.))
(def ytext (.getText doc "content"))

(def $editor (.getElementById js/document "editor"))
(def $filename (.getElementById js/document "filename"))
(def $status (.getElementById js/document "statusbar"))
(def $save (.getElementById js/document "save-btn"))

(defn post! [msg]
  (.postMessage js/window.parent msg "*"))

(defn get-content []
  (.toString ytext))

(defn set-content! [text]
  (.transact doc
    (fn []
      (.delete ytext 0 (.length ytext))
      (.insert ytext 0 (or text "")))))

(defn sync-editor! []
  (let [text (get-content)]
    (when (not= text (.-value $editor))
      (set! (.-value $editor) text))))

(defn on-input! [_]
  (let [text (.-value $editor)]
    (.transact doc
      (fn []
        (when (not= text (get-content))
          (.delete ytext 0 (.length ytext))
          (.insert ytext 0 text))))))

(defn status! [text err?]
  (set! (.-textContent $status) text)
  (.toggle (.-classList $status) "error" (boolean err?)))

(defn render! []
  (let [{:keys [filename saving]} @state]
    (set! (.-textContent $filename) filename)
    (set! (.-disabled $save) saving)))

(defn load! [msg]
  (set-content! (.-content msg))
  (sync-editor!)
  (swap! state assoc
    :filename (or (.-filename msg) "Untitled.txt")
    :saving false)
  (render!))

(defn save! []
  (when-not (:saving @state)
    (let [chosen (.prompt js/window "Save to your desktop as:" (:filename @state))]
      (when chosen
        (let [name (.trim chosen)]
          (if (zero? (.-length name))
            (status! "Filename required" true)
            (do
              (swap! state assoc :filename name :saving true)
              (render!)
              (status! "" false)
              (post! #js {:type "save"
                          :filename name
                          :content (get-content)}))))))))

(defn handle-msg [msg]
  (case (.-type msg)
    "init" (load! msg)
    "init:fresh" (load! msg)
    "save:complete" (do
                      (swap! state assoc :saving false)
                      (render!)
                      (status! "Saved" false))
    "save:error" (do
                   (swap! state assoc :saving false)
                   (render!)
                   (status! (.-message msg) true))
    nil))

(def messages$
  (-> (js/rxjs.fromEvent js/window "message")
      (.pipe (js/rxjs.map #(.-data %)))
      (.pipe (js/rxjs.filter #(.-type %)))))

(.observe ytext sync-editor!)
(.addEventListener $editor "input" on-input!)
(.addEventListener $save "click" #(save!))
(.subscribe messages$ handle-msg)
(post! #js {:type "ready"})