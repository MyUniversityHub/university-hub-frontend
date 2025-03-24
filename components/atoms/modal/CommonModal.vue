<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="popup-common fixed inset-0 bg-black/50 flex justify-center z-50"
           :class="modalPosition"
           @click.self="emitClickOutside ">
        <div
            class="bg-white rounded-lg shadow-lg w-full"
            :style="`width: ${width}`">
          <!-- Header -->
          <div v-if="hasHeader" :class="['border-b p-4', classHeader]">
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">
                <slot name="header">{{ title }}</slot>
              </h2>
              <button class="btn btn-xs btn-icon btn-light" @click="emitClose">
                <i class="ki-outline ki-cross"></i>
              </button>
            </div>
            <slot name="sub-header"></slot>
          </div>
          <div class="overflow-auto max-h-[60vh] scrollable">
            <!-- Body -->
            <div class="modal-body mt-4">
              <slot>{{ body }}</slot>
            </div>
          </div>
          <!-- Footer -->
          <div v-if="hasFooter" class="modal-footer flex justify-end gap-4 mt-4 border-t p-4">
            <slot name="footer">
              <button class="btn btn-light" @click="emitClose">Hủy</button>
              <button class="btn btn-danger" @click="emitConfirm">Xác nhận</button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, defineEmits } from "vue";


const props = defineProps({
  visible: Boolean, // Hiển thị modal
  title: { type: String, default: "Xác nhận thao tác" },
  body: { type: String, default: "Bạn có chắc chắn muốn thực hiện thao tác này?" },
  width: { type: String, default: "700px" },
  position: { type: String, default: "top" },
  hasHeader: { type: Boolean, default: true },
  hasFooter: { type: Boolean, default: true },
  classHeader: { type: String, default: "" },
});
const emit = defineEmits(["close", "confirm", "clickOutside "]);

const emitClose = () => {
  emit("close");
};

const emitClickOutside = () => {
  if (Object.keys(getCurrentInstance()?.vnode.props || {}).includes("onClickOutside")) {
    emit("clickOutside");
  } else {
    emitClose();
  }
};

const emitConfirm = () => {
  emit("confirm");
};

// const maxWidth = computed(() => `max-w-[${props.width}] w-full`);
const modalPosition = computed(() => {
  return {
    top: "items-start pt-10",
    center: "items-center",
    bottom: "items-end pb-10"
  }[props.position] || "items-center";
});
</script>

<style scoped>
.popup-common {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1300;
  display: flex;
  justify-content: center;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
