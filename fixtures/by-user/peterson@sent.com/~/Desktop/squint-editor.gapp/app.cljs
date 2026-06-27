(ns editor)

(def state (atom {:status :waiting :filename "Untitled.txt"}))
(def doc (js/Y.Doc.))
(def ycontent (.getText doc "content"))

(defn to-parent [msg]
  (.postMessage js/window.parent msg "*"))

(def messages$
  (-> (js/rxjs.fromEvent js/window "message")
      (.pipe (js/rxjs.map #(.-data %)))
      (.pipe (js/rxjs.filter #(.-type %)))))

(defmulti handle #(.-type %))

(defmethod handle "init" [msg]
  (swap! state assoc :status :ready :filename (.-filename msg)))

(defmethod handle "init:fresh" [msg]
  (swap! state assoc :status :ready :filename (.-filename msg)))

(defmethod handle "die" [_]
  (-> (js/Promise.resolve "die")
      (.then #(to-parent #js {:type "die:response" :result %}))))

(defmethod handle :default [_])

(.subscribe messages$ handle)

(.addEventListener (.getElementById js/document "save-btn") "click"
  #(to-parent #js {:type "save"
                   :filename (:filename @state)
                   :content (.-value (.getElementById js/document "editor"))}))

(to-parent #js {:type "ready"})