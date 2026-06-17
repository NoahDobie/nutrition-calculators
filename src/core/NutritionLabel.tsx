import React from 'react';
import type { Nutrition } from './types';
import { calculateDV, DV } from './nutrition';

interface Props {
  data: Nutrition;
  servingLabel?: string;
}

/** Bilingual (EN/FR) Canadian Nutrition Facts label. Brand-neutral. */
export const NutritionLabel: React.FC<Props> = ({ data, servingLabel = '1 serving' }) => {
  const f = (val: number) => Number(val.toFixed(1)).toString();

  return (
    <div className="bg-white p-5 border-2 border-black w-full max-w-[420px] font-sans text-base inline-block whitespace-nowrap">
      <div className="border-b-8 border-black pb-1 mb-1">
        <h2 className="text-3xl font-black leading-tight">Nutrition Facts</h2>
        <h3 className="text-2xl font-bold leading-tight italic">Valeur nutritive</h3>
      </div>

      <div className="border-b border-black py-1">
        <p className="text-sm whitespace-normal">Per {servingLabel} / par {servingLabel}</p>
      </div>

      <div className="border-b-8 border-black py-1 flex justify-between items-end">
        <p className="font-bold text-lg leading-none">Calories</p>
        <p className="font-black text-4xl leading-none">{Math.round(data.calories)}</p>
      </div>

      <div className="text-right border-b border-black py-0.5">
        <p className="text-[11px] font-bold">% Daily Value*</p>
        <p className="text-[11px] font-bold italic">% valeur quotidienne*</p>
      </div>

      <div className="border-b border-black py-1 flex justify-between">
        <div><span className="font-bold">Fat / Lipides</span> {f(data.fat)} g</div>
        <div className="font-bold">{calculateDV(data.fat, DV.FAT)} %</div>
      </div>

      <div className="border-b border-black py-1 pl-4 flex justify-between">
        <div>
          Saturated / saturés {f(data.saturatedFat)} g
          <br />+ Trans / trans {f(data.transFat)} g
        </div>
        <div className="font-bold">
          {calculateDV(data.saturatedFat + data.transFat, DV.SAT_TRANS_FAT)} %
        </div>
      </div>

      <div className="border-b border-black py-1 flex justify-between">
        <div><span className="font-bold">Carbohydrate / Glucides</span> {f(data.carbohydrates)} g</div>
        <div className="font-bold">{calculateDV(data.carbohydrates, DV.CARBS)} %</div>
      </div>

      <div className="border-b border-black py-1 pl-4 flex justify-between">
        <div>Fibre / Fibres {f(data.fibre)} g</div>
        <div className="font-bold">{calculateDV(data.fibre, DV.FIBRE)} %</div>
      </div>

      <div className="border-b border-black py-1 pl-4 flex justify-between">
        <div>Sugars / Sucres {f(data.sugars)} g</div>
        <div className="font-bold">{calculateDV(data.sugars, DV.SUGARS)} %</div>
      </div>

      <div className="border-b border-black py-1">
        <span className="font-bold">Protein / Protéines</span> {f(data.protein)} g
      </div>

      <div className="border-b border-black py-1">
        <span className="font-bold">Cholesterol / Cholestérol</span> {Math.round(data.cholesterol)} mg
      </div>

      <div className="border-b-4 border-black py-1 flex justify-between">
        <div><span className="font-bold">Sodium</span> {Math.round(data.sodium)} mg</div>
        <div className="font-bold">{calculateDV(data.sodium, DV.SODIUM)} %</div>
      </div>

      <div className="pt-2 text-[11px] leading-tight whitespace-normal">
        <p>* 5% or less is <span className="font-bold">a little</span>, 15% or more is <span className="font-bold">a lot</span></p>
        <p className="italic">* 5% ou moins c'est <span className="font-bold">peu</span>, 15% ou plus c'est <span className="font-bold">beaucoup</span></p>
      </div>
    </div>
  );
};
