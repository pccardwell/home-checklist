import type { Chore, Effort, Settings } from "./types";
import { addDays } from "./dates";

type Seed = [name: string, room: string, frequencyDays: number, effort: Effort, description: string];

const W = 7;
const M = 30;
const Y = 365;

export const SEED_VERSION = 2;

/** Starter chores introduced after v1, keyed by name, so upgrades only add genuinely new ones. */
export const ADDED_IN_VERSION: Record<string, number> = {
  "Wash & change bed sheets": 2,
};

export const DEFAULT_CHORES: Seed[] = [
  [
    "Clean microwave inside",
    "Kitchen",
    W,
    1,
    "Microwave a bowl of water with a few lemon slices or a splash of vinegar for 3–5 minutes, leave the door shut 2 more minutes to steam, then wipe everything down. Wash the turntable in the sink.",
  ],
  [
    "Wipe appliance fronts & handles",
    "Kitchen",
    W,
    1,
    "Spray a microfiber cloth (not the appliance) with all-purpose cleaner and wipe handles first, since they collect the most germs. For stainless steel, finish by buffing with the grain using a dry cloth.",
  ],
  [
    "Clean sink & drain",
    "Kitchen",
    W,
    1,
    "Sprinkle baking soda over the basin, scrub with a damp sponge, and rinse. Pour ½ cup baking soda then 1 cup vinegar down the drain, wait 10 minutes, and flush with hot water. Scrub around the faucet base with an old toothbrush.",
  ],
  [
    "Wash & change bed sheets",
    "Bedroom",
    W,
    2,
    "Strip the bed and wash sheets and pillowcases in the warmest water the care label allows. Air the mattress while they wash. Dry fully before putting them back (or put on a spare set) to avoid mustiness. Every other wash, add the mattress protector.",
  ],
  [
    "Clean shower & tub",
    "Bathroom",
    2 * W,
    2,
    "Spray the whole area with bathroom cleaner (or 1:1 hot vinegar and dish soap for soap scum) and let it sit 10–15 minutes. Scrub top to bottom with a long-handled brush, rinse, then squeegee or towel-dry the glass.",
  ],
  [
    "Wash bath mats",
    "Bathroom",
    2 * W,
    1,
    "Shake outside first. Wash warm with regular detergent, and skip fabric softener because it reduces absorbency. Rubber-backed mats: low heat or air dry so the backing doesn't crack.",
  ],
  [
    "Vacuum under furniture",
    "Living",
    2 * W,
    2,
    "Use the crevice tool and slim floor attachment. Lift light cushions and pull small furniture out. Work from the room's far side toward the door so you don't walk through finished areas.",
  ],
  [
    "Wipe light switches & door handles",
    "Whole house",
    2 * W,
    1,
    "Spray disinfectant onto a cloth (never directly on switches) and wipe switch plates, door knobs, cabinet pulls, and remotes. Let the disinfectant sit for its listed contact time before wiping dry.",
  ],
  [
    "Deep clean dishwasher filter",
    "Kitchen",
    M,
    1,
    "Twist out the cylindrical filter at the bottom of the tub. Soak it in hot soapy water for 10 minutes, scrub with a soft brush, rinse, and reinstall. Wipe the door gasket and spray-arm holes while you're at it, then run an empty hot cycle with a cup of vinegar on the top rack.",
  ],
  [
    "Clean garbage disposal",
    "Kitchen",
    M,
    1,
    "With the disposal off, scrub the rubber splash guard with a brush. Drop in a handful of ice cubes and a tablespoon of coarse salt, run cold water, and grind. Finish with a few citrus peels for freshness.",
  ],
  [
    "Degrease range hood filter",
    "Kitchen",
    M,
    2,
    "Pop out the metal mesh filter. Soak it 15 minutes in boiling water with ¼ cup baking soda and a squirt of dish soap, scrub with a soft brush, rinse, and dry completely before reinstalling. Charcoal filters can't be washed; replace those every 3–6 months.",
  ],
  [
    "Clean out fridge leftovers & wipe shelves",
    "Kitchen",
    M,
    2,
    "Do it the night before grocery day when the fridge is emptiest. Toss expired items, then wipe shelves top to bottom with warm water and a little baking soda. Put an open box of baking soda in back to absorb odors.",
  ],
  [
    "Scrub behind & around toilets",
    "Bathroom",
    M,
    2,
    "Spray the base, bolt caps, the floor behind the toilet, and the wall with disinfectant. Wait a few minutes, scrub with a dedicated toilet-area brush or disposable cloths, and wipe dry. Work clean-to-dirty: tank, lid, seat, then base.",
  ],
  [
    "Clean shower head & glass",
    "Bathroom",
    M,
    1,
    "Fill a plastic bag with white vinegar, rubber-band it over the shower head, and leave it an hour (or overnight), then run hot water. For glass, spray vinegar, wait 5 minutes, scrub with a non-scratch sponge, and squeegee.",
  ],
  [
    "Dust ceiling fans & vents",
    "Whole house",
    M,
    2,
    "Slide an old pillowcase over each fan blade and pull back, so the dust stays inside instead of falling. Vacuum vent covers with the brush attachment. Do this before vacuuming the floors.",
  ],
  [
    "Clean washer gasket & run clean cycle",
    "Laundry",
    M,
    1,
    "Pull back the door gasket and wipe out lint, hair, and mildew with a cloth dipped in diluted vinegar or bleach. Clean the detergent drawer, then run the empty \"Tub Clean\" or hottest cycle with a washer-cleaner tablet or 2 cups of vinegar. Leave the door open afterward to dry.",
  ],
  [
    "Dust baseboards",
    "Whole house",
    M,
    2,
    "Vacuum with the brush attachment first, then wipe with a damp microfiber cloth. A used dryer sheet run over them afterward helps repel dust. Use a long-handled flat mop to avoid kneeling.",
  ],
  [
    "Wash lint screen with soap",
    "Laundry",
    2 * M,
    1,
    "Keep removing lint after every load. Every couple of months, scrub the screen with warm soapy water and a soft brush to clear dryer-sheet residue that blocks airflow. Hold it under water: if water pools instead of passing through, it needs this. Let it dry fully before reinstalling.",
  ],
  [
    "Clean dryer vent duct",
    "Laundry",
    3 * M,
    3,
    "Unplug the dryer and pull it out. Disconnect the duct and run a dryer-vent brush kit (it attaches to a drill) through it and the lint-trap housing. Clean the outside vent flap too. This is a top cause of house fires, so don't skip it.",
  ],
  [
    "Flip / rotate mattress",
    "Bedroom",
    3 * M,
    2,
    "Rotate it 180° head to foot. Only flip it if it's double-sided (most modern mattresses aren't). Vacuum the top while it's bare, and sprinkle baking soda 30 minutes beforehand to deodorize.",
  ],
  [
    "Vacuum fridge coils",
    "Kitchen",
    3 * M,
    2,
    "Unplug the fridge. Coils are either behind the bottom kick plate or on the back. Loosen dust with a coil brush, then vacuum it up with the crevice tool. Clean coils help the fridge run cooler and cheaper.",
  ],
  [
    "Descale coffee maker / kettle",
    "Kitchen",
    3 * M,
    1,
    "Fill the reservoir with equal parts white vinegar and water and run half a brew cycle. Let it sit 30 minutes, finish the cycle, then run 2–3 cycles of plain water. Kettles: boil the same mix, let it sit, and rinse well.",
  ],
  [
    "Clean window tracks & sills",
    "Whole house",
    3 * M,
    2,
    "Vacuum loose dirt with the crevice tool. Sprinkle baking soda in the tracks, spray with vinegar, let it fizz 5 minutes, then scrub with an old toothbrush and wipe out with a cloth wrapped around a butter knife.",
  ],
  [
    "Wash pillows & duvet",
    "Bedroom",
    3 * M,
    2,
    "Check the labels. Wash two pillows at a time to keep the machine balanced, warm water, extra rinse. Dry on low with a couple of tennis or dryer balls to keep them fluffy, and make sure they're fully dry to prevent mildew.",
  ],
  [
    "Replace HVAC filter",
    "Whole house",
    3 * M,
    1,
    "Turn the system off. Note the size printed on the old filter's frame, and point the airflow arrow toward the furnace or blower. Write the date on the new filter's edge. Change it monthly if you have pets or allergies.",
  ],
  [
    "Clean oven",
    "Kitchen",
    6 * M,
    3,
    "Remove the racks. Spread a paste of baking soda and water over the interior (avoid the heating elements) and leave it overnight. Spray with vinegar, wipe the foam off with a damp cloth, and scrape stubborn spots with a plastic scraper. Soak the racks in the tub with hot water and dish soap.",
  ],
  [
    "Wash curtains",
    "Living",
    6 * M,
    2,
    "Check the label. Most can go on a gentle cycle in cool water. Remove hooks first. Rehang them slightly damp so they dry wrinkle-free. Vacuum blinds and curtain rods while the curtains are down.",
  ],
  [
    "Deep clean fridge & freezer",
    "Kitchen",
    6 * M,
    3,
    "Empty it into a cooler. Remove the shelves and drawers and wash them in warm soapy water; let glass shelves warm up first so they don't crack. Wipe the interior with baking soda and water, clean the door seals with a toothbrush, and dry everything before restocking.",
  ],
  [
    "Test smoke & CO detectors",
    "Whole house",
    6 * M,
    1,
    "Press and hold the test button on each unit until it beeps. Replace batteries (an easy habit is when the clocks change). Vacuum the vents, and replace any detector older than 10 years (check the date on the back).",
  ],
  [
    "Clean out gutters",
    "Outdoor",
    Y,
    3,
    "Best done in late fall after the leaves drop. Use a sturdy ladder with a spotter, scoop debris into a bucket with a gutter scoop, then flush with a hose to check that the downspouts drain. Never lean the ladder on the gutters themselves.",
  ],
  [
    "Flush water heater",
    "Utility",
    Y,
    3,
    "Turn off the power or gas and the cold-water supply. Attach a hose to the drain valve and run it outside or to a floor drain. Open a hot tap upstairs, drain until the water runs clear, then refill completely before turning the heat back on.",
  ],
];

export const DEFAULT_SETTINGS: Settings = {
  choreDays: [1, 2, 3, 4, 5, 6, 0],
  maxPerDay: 0,
  weekStartsOn: 0,
};

/**
 * Starter chores get their first due date spread across one cycle (capped so
 * yearly chores still show up within a few months), using the golden ratio so
 * neighbouring chores don't bunch up.
 */
export function defaultChores(today: string): Chore[] {
  return DEFAULT_CHORES.map(([name, room, frequencyDays, effort, description], i) => {
    const spread = Math.min(frequencyDays, 120);
    const offset = Math.floor(((i * 0.618034) % 1) * spread);
    return {
      id: crypto.randomUUID(),
      name,
      room,
      frequencyDays,
      effort,
      enabled: true,
      description,
      startDate: addDays(today, offset),
    };
  });
}
