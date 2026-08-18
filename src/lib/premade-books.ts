import type { Book } from "./book-types";

import coverBeginning from "@/assets/cover-beginning.jpg";
import coverFables from "@/assets/cover-fables.jpg";
import coverThinking from "@/assets/cover-thinking.jpg";
import coverLantern from "@/assets/cover-lantern.jpg";

const made = (input: Omit<Book, "generatedAt" | "provider" | "sources"> & { sources?: Book["sources"] }): Book => ({
  ...input,
  sources: input.sources ?? [],
  provider: "AnyBook Library edition",
  generatedAt: "2026-01-01T00:00:00.000Z",
});

export const PREMADE_BOOKS: Book[] = [
  made({
    id: "lib-art-of-beginning",
    title: "The Art of Beginning",
    author: "Oliver Compston",
    subject: "Starting work before you feel ready",
    language: "en",
    style: "guide",
    coverImage: coverBeginning,
    description:
      "A short, practical book about the hardest part of any project: the first move. Four chapters on shrinking the first step, surviving the ugly middle of day one, and building a habit of starting again.",
    chapters: [
      {
        title: "The Smallest Possible First Step",
        summary: "Why starting is hard and how to shrink the step until it is unavoidable.",
        content: `Nobody is defeated by the work. People are defeated by the size of the first step they imagine.

Ask someone why they haven't started writing their book, and they will describe the whole book. Ask why they haven't started running, and they will describe a marathon. The mind refuses tasks it cannot see the end of, so it quietly files them under "later," which is a folder that no one ever opens.

The way through is unglamorous. Shrink the first step until refusing it would be absurd. Not "write the book" but "open a blank file and name it." Not "run" but "put the shoes by the door." A step small enough to be embarrassing is a step small enough to take today, and once taken it changes what you are. You are no longer a person who intends to write; you are a person with a file open.

### The two-minute floor

Give every ambition a two-minute floor: the smallest version you will still do on your worst day. On good days you will overshoot it wildly. On bad days the floor keeps the streak alive, and the streak is the real asset. Momentum is not motivation. Motivation is a mood; momentum is a record.

### Exercise

Write down the project you have been circling for months. Underneath it, write the version of it that takes two minutes. Do that version now, before you read chapter two.`,
      },
      {
        title: "The Ugly Middle of Day One",
        summary: "Handling the discouragement that arrives immediately after starting.",
        content: `Everyone expects starting to feel good. It rarely does. The first hour of real work is where the gap between your taste and your ability is widest, and that gap hurts.

This is not a sign you chose wrong. It is the ordinary tax of being a beginner: you can recognise good work long before you can produce it. The people who continue are not the ones who skip the ugly middle. They are the ones who expect it and keep going anyway, treating early bad output as raw material rather than a verdict.

So plan for it. Decide, in advance, that the first draft is allowed to be poor. Decide that your first ten attempts are practice, not proof. Name the discouragement when it arrives — "ah, the ugly middle" — because a named feeling loses most of its authority.

### A rule for day one

End every first session mid-sentence, mid-task, mid-thought. Leave a thread hanging. Tomorrow you will not face a blank page; you will face an unfinished line, which is the easiest thing in the world to pick up.`,
      },
      {
        title: "Systems That Start Themselves",
        summary: "Designing an environment so beginning stops requiring willpower.",
        content: `Willpower is a poor engine because it needs refuelling every morning. Environment is a better one because it works while you are tired.

Look at where your work happens. Is the tool already open? Are the materials already out? Is the distraction one tap away or four? Most people try to become more disciplined when they should simply be making the right action closer and the wrong action further.

Three moves cover most of it. First, pre-decide: choose tomorrow's exact first action before you stop today. Second, pre-stage: leave the physical or digital scene set for that action. Third, pre-commit: attach the action to something that already happens reliably — after the kettle boils, after the school drop-off, after you sit down.

### Measuring what matters

Count sessions, not results. Results arrive in bursts and are unfair to your effort; sessions are entirely within your control. A month of sessions has never failed to produce results, but a month of waiting for results has never produced a session.`,
      },
      {
        title: "Beginning Again",
        summary: "What to do after you stop, and how to make restarting routine.",
        content: `You will stop. Illness, work, grief, or plain ordinary drift will interrupt you, and one missed day will become nine. The skill that separates people who finish things is not consistency. It is the speed of the restart.

Treat the restart as a scheduled part of the work rather than a moral failure. Write a restart note now, while you are motivated: three lines telling your future self exactly where you were, what the next tiny step is, and why the project mattered. When you return, you will not have to reconstruct anything. You will just do the tiny step.

And lower the bar for the comeback session absurdly low. The purpose of the first session back is not progress; it is to prove that the door is still open.

### Closing

Everything worth having was started by someone who did not feel ready. The readiness you are waiting for is manufactured by the beginning, not before it. Begin badly, begin small, and begin again — that is the entire art.`,
      },
    ],
  }),
  made({
    id: "lib-fables-modern-nights",
    title: "Fables for Modern Nights",
    author: "AnyBook Press",
    subject: "Short moral fables for contemporary life",
    language: "en",
    style: "novel",
    coverImage: coverFables,
    description:
      "Four short fables written in the old style but set among screens, cities and deadlines. Each ends with a moral you can carry into a Tuesday.",
    chapters: [
      {
        title: "The Fox and the Endless Feed",
        summary: "A fox discovers a stream that never stops offering, and learns what appetite costs.",
        content: `A fox came upon a stream that ran with everything he had ever wanted to see. Birds he had never chased, hens he had never met, other foxes cleverer than himself. The stream never ended, and it asked nothing of him but that he stay.

He stayed. He watched a thousand hens he never tasted and a hundred hunts he never ran. When at last he stood up, the moon had crossed the sky and his legs had forgotten how to run.

A badger passing by asked what he had eaten that night.

"Nothing," said the fox, "but I have seen a great deal."

**Moral:** A stream that never ends is not generous. It is simply deep enough to drown in.`,
      },
      {
        title: "The Two Builders",
        summary: "One builder waits for perfect stone; the other builds with what is on the ground.",
        content: `Two builders were given the same field and the same season.

The first went looking for perfect stone. He measured quarries, rejected three, drew plans he then improved, and improved again, so that by autumn he had the finest drawings in the province and a field of long grass.

The second gathered the stones already lying in the field. Her first wall leaned and she took it down. Her second wall held. By autumn she had a small crooked house with a good roof, and she spent the winter inside it, fixing what the weather revealed.

In spring the first builder came to see the crooked house, and found it larger than he remembered, because all winter she had been adding rooms.

**Moral:** The perfect plan and the finished house are rarely built by the same hands.`,
      },
      {
        title: "The Lamp That Refused to Be Borrowed",
        summary: "A lamp guards its light and discovers the arithmetic of generosity.",
        content: `In a dark street stood a lamp who burned very well and knew it.

When a small candle asked for a flame, the lamp refused. "Light spent is light lost," it said, and burned on alone, admired by no one because no one walked a street so dark.

Down the road, a second lamp gave its flame to every candle that asked. Soon the whole road glowed, and travellers came that way each night, and the lamp was never lonely and never once burned dimmer for the giving.

When the oil in both lamps finally ran low, one street went dark, and the other stayed bright with a hundred small flames.

**Moral:** Some things are diminished by sharing. Light is not one of them.`,
      },
      {
        title: "The Deadline and the River",
        summary: "A clerk tries to hurry a river and learns the difference between speed and pace.",
        content: `A clerk with an impossible deadline came to a river and demanded it flow faster.

The river did not answer, so the clerk beat the water with his hands until he was soaked and exhausted, and the river arrived at the sea exactly when it always had.

The next day he came back and built a small wheel at the bank. The same river turned it, and the wheel ground his grain while he sat on the grass.

**Moral:** You cannot make the river hurry. You can decide what it turns while it passes.`,
      },
    ],
  }),
  made({
    id: "lib-clear-thinking",
    title: "A Short Course in Clear Thinking",
    author: "Dr. S. Parrish-Hale",
    subject: "Practical reasoning and decision making",
    language: "en",
    style: "textbook",
    coverImage: coverThinking,
    description:
      "A compact textbook on reasoning: how claims are structured, where they usually break, and a simple procedure for making decisions you can defend later.",
    chapters: [
      {
        title: "What a Claim Is Made Of",
        summary: "Premises, conclusions, and the hidden assumption that carries the weight.",
        content: `**Learning objectives.** By the end of this chapter you should be able to separate a conclusion from its premises, name a hidden assumption, and state what evidence would change your mind.

Every argument has three parts, though usually only two are spoken. There is the conclusion (what someone wants you to accept), the premises (the reasons offered), and the assumption that quietly links them.

Consider: "This candidate went to a good university, so she'll do well here." The premise is the university. The conclusion is future performance. The assumption — never stated, doing all the work — is that university quality predicts performance in this specific role. Once you say the assumption out loud, it becomes testable, and testable assumptions are where clear thinking begins.

### Worked example

Claim: "We should cut the training budget; profits fell last quarter."
- Conclusion: cut the training budget.
- Premise: profits fell.
- Assumption: training spend is a cause of, or at least unrelated to, the fall.

Notice that the assumption may be exactly backwards. That possibility is invisible until the assumption is named.

### Exercises

1. Find a headline and write out its three parts.
2. For each, write the single piece of evidence that would most change your mind.
3. If no evidence could change your mind, mark the claim as a value, not a fact. Both are legitimate; confusing them is not.`,
      },
      {
        title: "The Five Failures",
        summary: "The small set of reasoning errors that cause most bad decisions.",
        content: `Most everyday error comes from a short list, and knowing the list is most of the defence.

**1. Confirmation search.** You look for evidence that you are right. Remedy: before deciding, write the strongest case against your position, in full sentences.

**2. Small-sample confidence.** Three examples feel like a pattern. Remedy: ask "out of how many?" before accepting any ratio.

**3. Survivor visibility.** You see the successes because the failures did not stay to be interviewed. Remedy: ask where the people who tried this and failed went.

**4. Cause from sequence.** B followed A, so A caused B. Remedy: propose a third factor that could cause both, and then look for it.

**5. Cost already spent.** You continue because you have invested. Remedy: ask what you would choose if you arrived today, knowing nothing of the past.

### Chapter summary

The failures share a shape: each substitutes an easy question for a hard one. Clear thinking is largely the discipline of noticing the substitution.

### Exercises

Take a decision you regret. Which of the five failures was operating? Which single question, asked earlier, would have caught it?`,
      },
      {
        title: "A Procedure for Deciding",
        summary: "A repeatable six-step method with a written record.",
        content: `Good decisions are not the ones that turn out well; luck decides outcomes. Good decisions are the ones a reasonable person would repeat given the same information. That means the procedure, not the result, is what you can improve.

**Step 1. State the decision as a question with options.** Vague decisions cannot be evaluated.

**Step 2. Name what you are optimising for**, and rank the criteria. Most disagreement is not about facts but about which criterion comes first.

**Step 3. Gather disconfirming information first.** Ten minutes looking for reasons you are wrong is worth an hour of supportive reading.

**Step 4. Write the prediction.** "If we choose A, I expect X within Y weeks, with roughly Z confidence." A prediction on paper is the only way to learn from experience.

**Step 5. Decide, and record the reasons.** Three lines is enough.

**Step 6. Review on a fixed date.** Compare the outcome to the prediction, not to your memory of the prediction, which will have quietly improved itself.

### Worked example

Question: hire a contractor or train an existing employee?
Criteria: speed first, cost second, retained knowledge third.
Disconfirming search: past contractor projects here ran two weeks late on average.
Prediction: contractor delivers in six weeks, 60% confidence; training delivers in ten weeks, 75% confidence, plus retained knowledge.
Decision recorded. Review date set.

### Exercises

Run the six steps on a real decision this week. Keep the record. In a month, score your calibration: of the things you were 70% sure about, did roughly 70% happen?`,
      },
    ],
  }),
  made({
    id: "lib-lantern-keeper",
    title: "The Lantern Keeper",
    author: "Marisol Vane",
    subject: "A bedtime story about sharing light",
    language: "en",
    style: "children",
    coverImage: coverLantern,
    description:
      "A gentle bedtime story in three short chapters about a child, a small lantern, and a village that had forgotten how to find its way home.",
    chapters: [
      {
        title: "The Small Light",
        summary: "Juno is given a lantern and told to keep it safe.",
        content: `On the last house at the top of the hill lived a child named Juno, and in Juno's hands was the smallest lantern in the village.

"Keep it safe," said Grandmother, "and keep it lit."

So Juno did. Juno kept the lantern under a blanket where the wind could not reach it, and checked it four times every night, and never, ever took it outside.

The lantern stayed lit. But the hill stayed dark, and Juno slept with one eye open, worrying.`,
      },
      {
        title: "The Long Dark Road",
        summary: "A lost fisherman calls from the road below.",
        content: `One night a voice came up the hill. "Hello? Is anyone there? I cannot find the road."

Juno peeked out. Far below, a fisherman turned in slow circles in the dark, his boots in the wrong ruts, his coat wet with sea.

Juno looked at the lantern under its blanket. If the blanket came off, the wind might come in. If the wind came in, the light might go out.

But the voice called again, smaller now, and Juno lifted the blanket.

The little light did not blow out. It leaned, and flickered, and stood up straight — and it reached all the way down the hill.

"There!" cried the fisherman. "There is the road!"`,
      },
      {
        title: "A Hill Full of Lanterns",
        summary: "The village learns what one small light can start.",
        content: `The next night, the fisherman came up the hill with a candle. "Might I borrow a little of your fire?"

Juno tipped the lantern gently, and the candle caught.

The night after, the baker came, and the twins from the bridge, and the old woman who kept the goats. Each brought something small to light, and each went home carrying a piece of Juno's flame.

Soon the whole hill glowed, from the last house at the top all the way down to the water, and no one who walked that road was ever lost again.

And Juno's lantern? It burned exactly as brightly as before.

Grandmother smiled from the doorway. "You kept it safe," she said. "And you kept it lit."

*The end. Sleep well.*`,
      },
    ],
  }),
];
