import React from "react";
import { ArrowLeft } from "lucide-react";
import FollowUpForm from "./FollowUpForm";

const FollowUpSection = ({ appointment, onBack, onSaved }) => {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-pavlova-100/30 backdrop-blur-md  px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-lg px-3 py-1 text-secondary-default hover:bg-secondary-light hover:text-secondary-dark transition"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-s text-primary-default">
          นัดติดตามอาการของ{" "}
          <span className="text-secondary-dark">
            {appointment.patient_first_name} {appointment.patient_last_name}
          </span>
        </h2>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <FollowUpForm
            appointment={appointment}
            onSaved={() => {
              onSaved(); //รีเฟรชหน้า Diagnosis
            }}
            onCancel={onBack}
          />
        </div>
      </div>
    </div>
  );
};

export default FollowUpSection;
