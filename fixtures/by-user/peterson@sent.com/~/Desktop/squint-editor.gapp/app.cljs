(ns editor)

(def SAVE_TIMEOUT_MS 15000)

(def state (atom {:saving false :opening false :filename "Untitled.txt"}))

(def $editor (.getElementById js/document "editor"))
(def $filename (.getElementById js/document "filename"))
(def $status (.getElementById js/document "statusbar"))
(def $save (.getElementById js/document "save-btn"))
(def $open (.getElementById js/document "open-btn"))

(defn post! [msg]
  (.postMessage js/window.parent msg "*"))

(defn get-content []
  (.-value $editor))

(defn set-content! [text]
  (set! (.-value $editor) (or text "")))

(defn status! [text err?]
  (set! (.-textContent $status) text)
  (.toggle (.-classList $status) "error" (boolean err?)))

(defn render! []
  (set! (.-disabled $save) (:saving @state))
  (set! (.-disabled $open) (:opening @state))
  (set! (.-textContent $filename) (:filename @state)))

(defn load! [msg]
  (set-content! (.-content msg))
  (swap! state assoc :saving false :filename (or (.-filename msg) "Untitled.txt"))
  (render!)
  (status! "" false))

(defn clear-save-timeout! []
  (when-let [id (:save-timeout @state)]
    (.clearTimeout js/window id)
    (swap! state dissoc :save-timeout)))

(defn schedule-save-timeout! []
  (clear-save-timeout!)
  (swap! state assoc :save-timeout
    (.setTimeout js/window
      (fn []
        (when (:saving @state)
          (swap! state assoc :saving false)
          (render!)
          (status! "Save timed out — try again" true)))
      SAVE_TIMEOUT_MS)))

(defn save! []
  (when-not (:saving @state)
    (let [chosen (.prompt js/window "Save to your desktop as:" (:filename @state))]
      (when-not (nil? chosen)
        (let [filename (.trim chosen)]
          (if (zero? (.-length filename))
            (status! "Save cancelled — filename is required" true)
            (do
              (swap! state assoc :saving true :filename filename)
              (render!)
              (status! "" false)
              (schedule-save-timeout!)
              (post! #js {:type "save"
                          :filename filename
                          :content (get-content)}))))))))

(defn open! []
  (when-not (:opening @state)
    (swap! state assoc :opening true)
    (render!)
    (.then (js/openFilePicker)
           (fn [result]
             (swap! state assoc :opening false)
             (render!)
             (when result
               (load! result)
               (status! (str "Opened " (.-filename result)) false)))
           (fn [err]
             (swap! state assoc :opening false)
             (render!)
             (status! (if (and err (.-message err)) (.-message err) "Failed to open") true)))))

(defn handle-msg [msg]
  (case (.-type msg)
    "init" (load! msg)
    "init:fresh" (load! msg)
    "save:complete" (do
                      (clear-save-timeout!)
                      (swap! state assoc :saving false)
                      (when-let [name (.-filename msg)]
                        (swap! state assoc :filename name))
                      (render!)
                      (status! "Saved" false))
    "save:error" (do
                   (clear-save-timeout!)
                   (swap! state assoc :saving false)
                   (render!)
                   (status! (.-message msg) true))
    nil))

(defn on-kernel-message! [event]
  (let [msg (.-data event)]
    (when (and (object? msg) (.-type msg))
      (handle-msg msg))))

(.addEventListener $save "click" #(save!))
(.addEventListener $open "click" #(open!))
(.addEventListener js/window "message" on-kernel-message!)
(.addEventListener js/document "keydown"
  (fn [e]
    (when (and (or (.-metaKey e) (.-ctrlKey e)) (= "s" (.-key e)))
      (.preventDefault e)
      (save!))))
(post! #js {:type "ready"})
