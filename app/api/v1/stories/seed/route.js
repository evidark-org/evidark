import { NextResponse } from "next/server";
import Story from "@/models/StoryModel";
import User from "@/models/UserModel";
import connectMongoDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    await connectMongoDB();

    // Create a sample author if none exists
    let author = await User.findOne({ email: "author@evidark.com" });
    if (!author) {
      author = await User.create({
        name: "Edgar Darkwood",
        email: "author@evidark.com",
        username: "edgar_darkwood",
        role: "author",
        verified: true,
        photo: "https://ui-avatars.com/api/?name=Edgar+Darkwood&background=dc2626&color=fff",
        bio: "Master of dark tales and spine-chilling narratives",
        xp: 1500,
        creatorScore: 850
      });
    }

    // Sample stories data
    const sampleStories = [
      {
        title: "The Curse of Blackwood Manor",
        slug: "the-curse-of-blackwood-manor",
        content: `<h2>Chapter 1: The Inheritance</h2>
        
        <p>The letter arrived on a Tuesday morning, its parchment yellowed with age and sealed with black wax. Margaret Thornfield stared at the elegant script that spelled out her name, her hands trembling as she broke the seal.</p>
        
        <p><em>"Dear Miss Thornfield,"</em> it began, <em>"It is with great solemnity that I inform you of your great-uncle Mortimer's passing. As his sole surviving heir, you have inherited Blackwood Manor and all its... peculiarities."</em></p>
        
        <h3>The Journey to Blackwood</h3>
        
        <p>The carriage ride through the moors was treacherous, with fog so thick that Margaret could barely see beyond the horses' heads. The driver, a gaunt man with hollow eyes, had said nothing since picking her up at the station. His silence was more unnerving than any conversation could have been.</p>
        
        <p>As they approached the manor, lightning illuminated the imposing structure against the storm clouds. Blackwood Manor stood like a monument to darkness itself—its Gothic spires reaching toward the heavens like gnarled fingers, its windows black and empty as dead eyes.</p>
        
        <h3>The First Night</h3>
        
        <p>The housekeeper, Mrs. Grimsby, was waiting at the entrance. Her face was pale as moonlight, and her eyes held secrets that seemed to span centuries.</p>
        
        <p>"Welcome to Blackwood Manor, Miss," she said, her voice barely above a whisper. "Your uncle's room has been prepared, though I must warn you... strange things happen after midnight in this house."</p>
        
        <p>Margaret dismissed the warning as superstition, but as she lay in the four-poster bed that night, she heard them—footsteps in the corridor above, slow and deliberate, as if someone was pacing back and forth. But according to Mrs. Grimsby, that floor had been sealed off for decades.</p>
        
        <h3>The Discovery</h3>
        
        <p>The next morning, Margaret found a hidden door behind the library bookshelf. The passage led to a spiral staircase that climbed to the forbidden floor. Against all reason, she ascended.</p>
        
        <p>What she found there would haunt her forever—a room filled with portraits, all of the same woman, painted across different centuries. And in each painting, the woman wore Margaret's face.</p>
        
        <p>At the center of the room sat an ornate mirror, its surface black as midnight. As Margaret approached, words began to appear in the glass, written in what looked like blood:</p>
        
        <p><strong>"Welcome home, Margaret. We've been waiting for you to return."</strong></p>
        
        <p>The mirror began to ripple like water, and from its depths, pale hands reached out toward her...</p>`,
        excerpt: "When Margaret inherits the mysterious Blackwood Manor, she discovers that some family legacies come with a terrible price. The portraits in the forbidden room all bear her face, and the mirror holds secrets that span centuries.",
        author: author._id,
        status: "published",
        categories: ["Horror", "Gothic", "Supernatural"],
        tags: ["manor", "inheritance", "curse", "mirror", "portraits"],
        views: 1247,
        likes: 89,
        bookmarks: 34,
        commentsCount: 12,
        readTime: 8,
        contentWarnings: ["Supernatural Horror", "Dark Themes"],
        ageRating: "16+",
        mediaEvidence: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1520637836862-4d197d17c35a?w=800",
            caption: "Blackwood Manor on a stormy night"
          }
        ]
      },
      {
        title: "The Whispering Woods",
        slug: "the-whispering-woods",
        content: `<h2>The Forest That Remembers</h2>
        
        <p>Local legends speak of a forest where the trees remember every soul that has ever walked beneath their branches. Sarah Chen, a folklore researcher, came to Millbrook to document these stories. She never expected to become part of one.</p>
        
        <h3>The First Whisper</h3>
        
        <p>It started as a gentle rustling, barely audible above the wind. But as Sarah ventured deeper into the woods with her recording equipment, the sounds became clearer—voices, speaking in languages she couldn't identify, telling stories of love, loss, and unspeakable horror.</p>
        
        <p>Her digital recorder captured nothing but static, yet the voices grew stronger with each step. They seemed to emanate from the very bark of the ancient oaks, their words weaving together into a symphony of human experience spanning millennia.</p>
        
        <h3>The Revelation</h3>
        
        <p>As twilight descended, Sarah realized she was lost. The familiar path had vanished, replaced by twisted roots and thorny undergrowth that seemed to shift when she wasn't looking directly at them.</p>
        
        <p>That's when she saw them—figures made of shadow and moonlight, dancing between the trees. They beckoned to her with translucent hands, their mouths moving in silent invitation.</p>
        
        <p>"Join us," the whispers said, now speaking in perfect English. "Add your story to ours. Let the forest remember you forever."</p>
        
        <p>Sarah ran, branches tearing at her clothes, roots trying to trip her with every step. Behind her, the laughter of the shadow dancers echoed through the night, growing closer with each heartbeat.</p>
        
        <p>She burst from the treeline just as dawn broke, gasping and bleeding, her equipment lost forever in the depths of the whispering woods. But even now, safe in her hotel room, she can still hear them calling her name...</p>`,
        excerpt: "Folklore researcher Sarah Chen ventures into the legendary Whispering Woods to document local legends, but discovers that some stories are better left untold when the forest itself begins to speak.",
        author: author._id,
        status: "published",
        categories: ["Horror", "Folklore", "Supernatural"],
        tags: ["forest", "whispers", "legends", "researcher", "shadows"],
        views: 892,
        likes: 67,
        bookmarks: 23,
        commentsCount: 8,
        readTime: 6,
        contentWarnings: ["Psychological Horror", "Supernatural Elements"],
        ageRating: "13+",
        mediaEvidence: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
            caption: "The entrance to the Whispering Woods"
          }
        ]
      },
      {
        title: "The Last Transmission",
        slug: "the-last-transmission",
        content: `<h2>Signal Lost</h2>
        
        <p>Radio operator Marcus Webb had been monitoring deep space transmissions for fifteen years. He thought he'd heard everything the universe had to offer—until the night he received a signal from Earth, dated fifty years in the future.</p>
        
        <h3>The Message</h3>
        
        <p>The transmission came through at 3:33 AM, cutting through the static like a knife through silk. The voice was human, unmistakably so, but filled with a desperation that made Marcus's blood run cold.</p>
        
        <p><em>"This is Dr. Elena Vasquez, transmitting from the ruins of New Geneva. If anyone receives this message, you must listen carefully. The event we call 'The Silence' begins in your time period. You have to stop them before—"</em></p>
        
        <p>The transmission cut to static, then resumed with a different voice, mechanical and cold:</p>
        
        <p><em>"Transmission intercepted. Source terminated. Resume your duties, Observer Webb. Your time approaches."</em></p>
        
        <h3>The Investigation</h3>
        
        <p>Marcus tried to dismiss it as an elaborate hoax, but the transmission's metadata was impossible to fake. The signal had indeed originated from Earth's coordinates, but from a timeline that shouldn't exist.</p>
        
        <p>He began researching Dr. Elena Vasquez and found her—a quantum physicist working on temporal communication theory at CERN. When he called her, she was very much alive and had never heard of "The Silence."</p>
        
        <p>But she was intrigued enough to meet him, and together they began to decode the fragments of future transmissions that arrived each night at 3:33 AM.</p>
        
        <h3>The Truth</h3>
        
        <p>The messages painted a picture of a world where humanity had made contact with something vast and incomprehensible. The entities didn't communicate through language or mathematics, but through silence itself—gaps in reality where sound, light, and thought simply ceased to exist.</p>
        
        <p>The final transmission was the most terrifying:</p>
        
        <p><em>"They're here. The Silence is spreading. Marcus, if you're receiving this, you were right to investigate. But it's too late. They've been watching you since the first transmission. Look behind you."</em></p>
        
        <p>Marcus turned around to find his radio room empty, but where his shadow should have been on the wall, there was only a perfect, soundless void...</p>`,
        excerpt: "Radio operator Marcus Webb receives transmissions from fifty years in the future, warning of an event called 'The Silence.' But investigating these messages may have already sealed his fate.",
        author: author._id,
        status: "published",
        categories: ["Sci-Fi Horror", "Cosmic Horror", "Time Travel"],
        tags: ["radio", "future", "transmission", "silence", "cosmic"],
        views: 1456,
        likes: 112,
        bookmarks: 45,
        commentsCount: 19,
        readTime: 7,
        contentWarnings: ["Cosmic Horror", "Existential Dread"],
        ageRating: "16+",
        mediaEvidence: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800",
            caption: "Radio equipment receiving signals from the void"
          }
        ]
      }
    ];

    // Check if stories already exist
    const existingStories = await Story.find({ 
      slug: { $in: sampleStories.map(s => s.slug) } 
    });

    if (existingStories.length > 0) {
      return NextResponse.json({ 
        message: "Sample stories already exist",
        stories: existingStories.map(s => ({ title: s.title, slug: s.slug }))
      });
    }

    // Create the stories
    const createdStories = await Story.insertMany(sampleStories);

    return NextResponse.json({ 
      message: "Sample stories created successfully",
      count: createdStories.length,
      stories: createdStories.map(s => ({ title: s.title, slug: s.slug }))
    });

  } catch (error) {
    console.error("Error seeding stories:", error);
    return NextResponse.json(
      { error: "Failed to seed stories", details: error.message },
      { status: 500 }
    );
  }
}
